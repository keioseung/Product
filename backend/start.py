#!/usr/bin/env python3
"""
Railway 배포를 위한 시작 스크립트
데이터베이스 마이그레이션을 자동으로 실행하고 서버를 시작합니다.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """명령어를 실행하고 결과를 출력합니다."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} 완료")
        if result.stdout:
            print(f"출력: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} 실패: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
        return False

def main():
    print("🚀 AI Mastery Hub Backend 시작 중...")
    
    # 현재 디렉토리를 backend로 변경
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print(f"📁 작업 디렉토리: {os.getcwd()}")
    
    # 데이터베이스 초기화
    print("🗄️ 데이터베이스 초기화 중...")
    if not run_command("python init_db.py", "데이터베이스 초기화"):
        print("⚠️ 데이터베이스 초기화 실패, 계속 진행...")
    
    # 환경변수에서 포트 가져오기 (Railway는 PORT 환경변수 사용)
    port = os.getenv("PORT", "8000")
    host = "0.0.0.0"
    
    print(f"🌐 서버 시작: {host}:{port}")
    
    # uvicorn으로 서버 시작
    os.execvp("uvicorn", [
        "uvicorn",
        "app.main:app",
        "--host", host,
        "--port", port,
        "--reload" if os.getenv("ENVIRONMENT") == "development" else "--no-reload"
    ])

if __name__ == "__main__":
    main() 