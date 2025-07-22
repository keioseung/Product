# Railway 배포 가이드

## 🚀 Railway 배포 설정

### 백엔드 배포 설정

1. **환경변수 설정**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   FRONTEND_URL=https://your-frontend-domain.up.railway.app
   ENVIRONMENT=production
   ```

2. **백엔드 시작 명령어**:
   ```bash
   cd backend && python start.py
   ```

### 프론트엔드 배포 설정

1. **환경변수 설정**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app
   NEXT_PUBLIC_APP_NAME=AI Mastery Hub
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

## 🔧 CORS 설정

백엔드는 다음 도메인들을 허용하도록 설정되어 있습니다:
- `http://localhost:3000` (로컬 개발)
- `https://simple-production-6bc9.up.railway.app` (프론트엔드)
- `FRONTEND_URL` 환경변수로 지정된 도메인

## 🗄️ 데이터베이스 마이그레이션

백엔드 시작 시 자동으로 다음 작업이 수행됩니다:
1. 테이블 생성 (`users`, `activity_logs`, `backup_history`)
2. 기본 관리자 계정 생성 (`admin` / `admin1234`)
3. 테스트 계정 생성 (`testuser` / `test1234`)

## ✅ 헬스체크

- **백엔드 상태**: `GET /health`
- **기본 응답**: `GET /`

## 🔍 문제 해결

### CORS 오류
- `FRONTEND_URL` 환경변수가 올바르게 설정되었는지 확인
- 백엔드와 프론트엔드 도메인이 CORS 허용 목록에 포함되어 있는지 확인

### 502 오류
- 백엔드 로그에서 데이터베이스 연결 오류 확인
- `DATABASE_URL` 환경변수가 올바르게 설정되었는지 확인
- PostgreSQL 데이터베이스가 실행 중인지 확인

### 인증 오류
- JWT 토큰이 올바르게 생성되고 있는지 확인
- 백엔드 `/health` 엔드포인트로 데이터베이스 연결 상태 확인 