#!/usr/bin/env python3
"""
Railway 배포용 데이터베이스 초기화 스크립트
"""

import os
import sys
from sqlalchemy import text

# 현재 디렉토리를 시스템 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def init_database():
    """데이터베이스를 초기화합니다."""
    try:
        from app.database import Base, engine, SessionLocal
        from app.models import User, ActivityLog, BackupHistory
        import bcrypt
        
        print("🗄️ 데이터베이스 테이블 생성 중...")
        
        # 모든 테이블 생성
        Base.metadata.create_all(bind=engine)
        print("✅ 테이블 생성 완료")
        
        # 세션 생성
        db = SessionLocal()
        
        try:
            # 기존 admin 사용자 확인
            existing_admin = db.query(User).filter(User.username == "admin").first()
            
            if not existing_admin:
                print("👤 기본 관리자 계정 생성 중...")
                
                # 관리자 계정 생성
                password_hash = bcrypt.hashpw("admin1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                admin_user = User(
                    username="admin",
                    email="admin@example.com",
                    password_hash=password_hash,
                    role="admin",
                    is_active=True
                )
                
                db.add(admin_user)
                db.commit()
                print("✅ 관리자 계정 생성 완료 (admin/admin1234)")
            else:
                print("ℹ️ 관리자 계정이 이미 존재합니다.")
                
            # 테스트 사용자 확인
            existing_user = db.query(User).filter(User.username == "testuser").first()
            
            if not existing_user:
                print("👤 테스트 사용자 계정 생성 중...")
                
                password_hash = bcrypt.hashpw("test1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                test_user = User(
                    username="testuser",
                    email="test@example.com",
                    password_hash=password_hash,
                    role="user",
                    is_active=True
                )
                
                db.add(test_user)
                db.commit()
                print("✅ 테스트 사용자 계정 생성 완료 (testuser/test1234)")
            else:
                print("ℹ️ 테스트 사용자 계정이 이미 존재합니다.")
                
        except Exception as e:
            print(f"⚠️ 사용자 계정 생성 중 오류: {e}")
            db.rollback()
        finally:
            db.close()
            
        print("🎉 데이터베이스 초기화 완료!")
        return True
        
    except Exception as e:
        print(f"❌ 데이터베이스 초기화 실패: {e}")
        return False

if __name__ == "__main__":
    init_database() 