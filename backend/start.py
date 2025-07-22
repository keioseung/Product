#!/usr/bin/env python3
"""
Railway 배포를 위한 시작 스크립트 (간단 버전)
"""

import os
import sys

def main():
    print("🚀 AI Mastery Hub Backend 시작 중...")
    
    # 환경변수에서 포트 가져오기 (Railway는 PORT 환경변수 사용)
    port = os.getenv("PORT", "8000")
    host = "0.0.0.0"
    
    print(f"🌐 서버 시작: {host}:{port}")
    print(f"📁 현재 디렉토리: {os.getcwd()}")
    print(f"🐍 Python 경로: {sys.executable}")
    
    # 데이터베이스 테이블 생성 시도 (실패해도 계속 진행)
    try:
        from app.database import Base, engine
        Base.metadata.create_all(bind=engine)
        print("✅ 데이터베이스 테이블 생성 완료")
    except Exception as e:
        print(f"⚠️ 데이터베이스 초기화 오류 (계속 진행): {e}")
    
    # uvicorn으로 서버 시작
    os.execvp("uvicorn", [
        "uvicorn",
        "app.main:app",
        "--host", host,
        "--port", port,
        "--access-log",
        "--log-level", "info"
    ])

if __name__ == "__main__":
    main() 