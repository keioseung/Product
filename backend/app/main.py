from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .api import ai_info, quiz, prompt, base_content, term, auth, logs, system

app = FastAPI()

# CORS 설정 - Railway 배포 환경에 맞게 조정
frontend_url = os.getenv("FRONTEND_URL", "https://simple-production-6bc9.up.railway.app")
allowed_origins = [
    "http://localhost:3000",  # 로컬 개발
    "http://127.0.0.1:3000",  # 로컬 개발 대체
    "https://simple-production-6bc9.up.railway.app",  # Railway 프론트엔드 
    frontend_url,  # 환경변수에서 가져온 URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# 헬스체크 엔드포인트
@app.get("/")
async def root():
    return {"message": "AI Mastery Hub Backend is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    from .database import engine
    try:
        # 데이터베이스 연결 테스트
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(logs.router, prefix="/api/logs", tags=["Activity Logs"])
app.include_router(system.router, prefix="/api/system", tags=["System Management"])
app.include_router(ai_info.router, prefix="/api/ai-info")
app.include_router(quiz.router, prefix="/api/quiz")
app.include_router(prompt.router, prefix="/api/prompt")
app.include_router(base_content.router, prefix="/api/base-content")
app.include_router(term.router, prefix="/api/term") 