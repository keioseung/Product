from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import io
import os

from ..database import get_db
from ..models import User, AIInfo, UserProgress, ActivityLog, BackupHistory, Quiz, Prompt, BaseContent, Term
from ..auth import get_current_active_user
from .logs import log_activity

router = APIRouter()

@router.post("/backup")
async def create_backup(
    include_tables: Optional[List[str]] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """전체 시스템 데이터를 백업합니다. (관리자만)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # 기본적으로 모든 테이블 백업
        if not include_tables:
            include_tables = ['users', 'ai_info', 'user_progress', 'activity_logs', 'quiz', 'prompt', 'base_content', 'term']
        
        backup_data = {
            "backup_info": {
                "created_at": datetime.now().isoformat(),
                "created_by": current_user.username,
                "description": description or "Manual backup",
                "tables_included": include_tables,
                "version": "1.0.0"
            },
            "data": {}
        }
        
        # 각 테이블 데이터 수집
        table_models = {
            'users': User,
            'ai_info': AIInfo,
            'user_progress': UserProgress,
            'activity_logs': ActivityLog,
            'quiz': Quiz,
            'prompt': Prompt,
            'base_content': BaseContent,
            'term': Term,
            'backup_history': BackupHistory
        }
        
        for table_name in include_tables:
            if table_name in table_models:
                model = table_models[table_name]
                records = db.query(model).all()
                
                # 모델 데이터를 딕셔너리로 변환
                table_data = []
                for record in records:
                    record_dict = {}
                    for column in record.__table__.columns:
                        value = getattr(record, column.name)
                        if isinstance(value, datetime):
                            value = value.isoformat()
                        record_dict[column.name] = value
                    table_data.append(record_dict)
                
                backup_data["data"][table_name] = table_data
        
        # 백업 파일명 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ai_mastery_backup_{timestamp}.json"
        
        # JSON 문자열 생성
        json_str = json.dumps(backup_data, indent=2, ensure_ascii=False)
        file_size = len(json_str.encode('utf-8'))
        
        # 백업 히스토리 저장
        backup_history = BackupHistory(
            filename=filename,
            file_size=file_size,
            backup_type='manual',
            tables_included=json.dumps(include_tables),
            description=description,
            created_by=current_user.id,
            created_by_username=current_user.username
        )
        db.add(backup_history)
        db.commit()
        
        # 백업 생성 로그 기록
        log_activity(
            db=db,
            action="시스템 백업 생성",
            details=f"백업 파일이 생성되었습니다. 파일명: {filename}, 크기: {file_size} bytes",
            log_type="system",
            log_level="success",
            user_id=current_user.id,
            username=current_user.username
        )
        
        # 파일 스트림으로 반환
        def generate():
            yield json_str
        
        return StreamingResponse(
            io.StringIO(json_str),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create backup: {str(e)}")

@router.post("/restore")
async def restore_backup(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """백업 파일을 업로드하여 시스템을 복원합니다. (관리자만)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    try:
        # 파일 내용 읽기
        content = await file.read()
        backup_data = json.loads(content.decode('utf-8'))
        
        # 백업 파일 검증
        if "backup_info" not in backup_data or "data" not in backup_data:
            raise HTTPException(status_code=400, detail="Invalid backup file format")
        
        backup_info = backup_data["backup_info"]
        data = backup_data["data"]
        
        # 트랜잭션 시작
        try:
            # 테이블 모델 매핑
            table_models = {
                'users': User,
                'ai_info': AIInfo,
                'user_progress': UserProgress,
                'activity_logs': ActivityLog,
                'quiz': Quiz,
                'prompt': Prompt,
                'base_content': BaseContent,
                'term': Term,
                'backup_history': BackupHistory
            }
            
            restored_tables = []
            
            # 현재 사용자 정보 백업 (복원 후 로그인 유지용)
            current_user_data = {
                'id': current_user.id,
                'username': current_user.username,
                'hashed_password': current_user.hashed_password
            }
            
            # 각 테이블 데이터 복원
            for table_name, table_data in data.items():
                if table_name in table_models and table_data:
                    model = table_models[table_name]
                    
                    # 기존 데이터 삭제 (사용자는 제외하고 나중에 처리)
                    if table_name != 'users':
                        db.query(model).delete()
                    
                    # 새 데이터 삽입
                    for record_data in table_data:
                        # 날짜 필드 변환
                        for key, value in record_data.items():
                            if key.endswith('_at') and isinstance(value, str):
                                try:
                                    record_data[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                                except:
                                    pass
                        
                        new_record = model(**record_data)
                        db.add(new_record)
                    
                    restored_tables.append(table_name)
            
            # 사용자 테이블 특별 처리 (현재 사용자 보존)
            if 'users' in data:
                db.query(User).delete()
                
                # 백업된 사용자들 복원
                for user_data in data['users']:
                    for key, value in user_data.items():
                        if key.endswith('_at') and isinstance(value, str):
                            try:
                                user_data[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                            except:
                                pass
                    
                    new_user = User(**user_data)
                    db.add(new_user)
                
                # 현재 관리자 사용자가 백업에 없으면 추가
                backup_usernames = [u['username'] for u in data['users']]
                if current_user.username not in backup_usernames:
                    admin_user = User(**current_user_data)
                    db.add(admin_user)
            
            db.commit()
            
            # 복원 완료 로그 기록
            log_activity(
                db=db,
                action="시스템 복원 완료",
                details=f"백업 파일에서 시스템이 복원되었습니다. 파일: {file.filename}, 복원된 테이블: {', '.join(restored_tables)}",
                log_type="system",
                log_level="success",
                user_id=current_user.id,
                username=current_user.username
            )
            
            return {
                "message": "System restored successfully",
                "restored_tables": restored_tables,
                "backup_info": backup_info
            }
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to restore data: {str(e)}")
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process backup file: {str(e)}")

@router.get("/backup-history")
def get_backup_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """백업 히스토리를 조회합니다. (관리자만)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    backups = db.query(BackupHistory).order_by(BackupHistory.created_at.desc()).limit(50).all()
    
    backup_list = []
    for backup in backups:
        backup_list.append({
            "id": backup.id,
            "filename": backup.filename,
            "file_size": backup.file_size,
            "backup_type": backup.backup_type,
            "tables_included": json.loads(backup.tables_included) if backup.tables_included else [],
            "description": backup.description,
            "created_by": backup.created_by_username,
            "created_at": backup.created_at.isoformat()
        })
    
    return {"backups": backup_list}

@router.delete("/backup-history/{backup_id}")
def delete_backup_history(
    backup_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """백업 히스토리 항목을 삭제합니다. (관리자만)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    backup = db.query(BackupHistory).filter(BackupHistory.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup history not found")
    
    db.delete(backup)
    db.commit()
    
    return {"message": "Backup history deleted successfully"}

@router.get("/system-info")
def get_system_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시스템 정보를 조회합니다. (관리자만)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # 테이블별 레코드 수 조회
    stats = {
        "users": db.query(User).count(),
        "ai_info": db.query(AIInfo).count(),
        "user_progress": db.query(UserProgress).count(),
        "activity_logs": db.query(ActivityLog).count(),
        "quiz": db.query(Quiz).count(),
        "prompt": db.query(Prompt).count(),
        "base_content": db.query(BaseContent).count(),
        "term": db.query(Term).count(),
        "backup_history": db.query(BackupHistory).count()
    }
    
    # 최근 백업 정보
    latest_backup = db.query(BackupHistory).order_by(BackupHistory.created_at.desc()).first()
    
    return {
        "version": "1.0.0",
        "table_stats": stats,
        "total_records": sum(stats.values()),
        "latest_backup": {
            "filename": latest_backup.filename if latest_backup else None,
            "created_at": latest_backup.created_at.isoformat() if latest_backup else None,
            "created_by": latest_backup.created_by_username if latest_backup else None
        } if latest_backup else None
    }

@router.delete("/clear-all-data")
def clear_all_data(
    confirm: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """모든 시스템 데이터를 삭제합니다. (관리자만, 매우 위험)"""
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Please set confirm=true to proceed with data deletion"
        )
    
    try:
        # 현재 관리자 사용자 정보 백업
        admin_data = {
            'username': current_user.username,
            'hashed_password': current_user.hashed_password,
            'role': current_user.role
        }
        
        # 모든 테이블 데이터 삭제
        db.query(ActivityLog).delete()
        db.query(UserProgress).delete()
        db.query(BackupHistory).delete()
        db.query(AIInfo).delete()
        db.query(Quiz).delete()
        db.query(Prompt).delete()
        db.query(BaseContent).delete()
        db.query(Term).delete()
        db.query(User).delete()
        
        # 관리자 계정 복원
        admin_user = User(**admin_data)
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # 데이터 삭제 로그 기록
        log_activity(
            db=db,
            action="전체 데이터 삭제",
            details="관리자가 모든 시스템 데이터를 삭제했습니다. (관리자 계정은 보존)",
            log_type="system",
            log_level="warning",
            user_id=admin_user.id,
            username=admin_user.username
        )
        
        return {"message": "All data cleared successfully. Admin account preserved."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear data: {str(e)}") 