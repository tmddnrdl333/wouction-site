# wouction

사내 약식 경매 사이트. 관리자가 물건을 등록하고, 일반 사용자는 비로그인 상태에서 댓글(이름 + 4자리 비밀번호)로 입찰 참여.

## 스택

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma + Supabase Postgres
- Supabase Storage (이미지)
- jose (JWT) + bcryptjs (비밀번호 해시)
- Zod (검증)

## 로컬 셋업

### 1. 환경변수 파일 만들기

`.env.example`을 복사해서 `.env.local` 생성:

```bash
cp .env.example .env.local
```

`.env.local`을 열어 다음 값 채우기:

- `DATABASE_URL`, `DIRECT_URL`: Supabase 콘솔 → Connect → ORMs → Prisma에서 복사. `[YOUR-PASSWORD]` 부분을 DB 비번으로 치환.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase 콘솔 → Connect → App Frameworks에서 복사.
- `SUPABASE_SECRET_KEY`: Supabase 콘솔 → Project Settings → API Keys → Secret keys 탭에서 복사. (Storage 업로드용)
- `SUPABASE_STORAGE_BUCKET`: `wouction-images` (이미 생성된 버킷)
- `ADMIN_USERNAME`: 원하는 관리자 ID
- `ADMIN_PASSWORD_HASH`: bcrypt 해시. 생성:
  ```bash
  npx -y bcryptjs-cli hash '원하는비번'
  ```
- `JWT_SECRET`: 96자 hex. 생성:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

### 2. DB 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속.

관리자 페이지: http://localhost:3000/admin/login

## Vercel 배포

1. GitHub에 push.
2. Vercel 프로젝트 Settings → Environment Variables에 `.env.local`과 동일한 값 등록 (Production + Preview 둘 다).
3. 다음 push 시 자동 배포.

> **주의**: `.env.local`은 절대 커밋 금지 (`.gitignore`에 포함됨).

## 디렉토리 구조

```
src/
├── app/
│   ├── actions/           # Server Actions (auth, items, bids)
│   ├── admin/             # 관리자 페이지
│   ├── items/[id]/        # 물건 상세
│   ├── closed/            # 종료된 경매 목록
│   ├── layout.tsx
│   └── page.tsx           # 진행 중 경매 목록 (홈)
├── components/            # Client / 서버 컴포넌트
└── lib/                   # db, session, dal, supabase, schemas, format
prisma/schema.prisma
proxy.ts                   # Next.js 16: middleware → proxy (관리자 경로 보호)
```

## 보안 메모

- 관리자 인증: env 기반 단일 계정. 로그인 성공 시 jose JWT 발급 → httpOnly + SameSite=Strict 쿠키 (8시간 만료).
- 입찰자 비번 4자리: bcrypt 해시 저장. 삭제 시 비교만, 노출 안 함.
- 이미지 업로드: MIME 화이트리스트 (jpeg/png/webp), 장당 최대 5MB.
- 관리자 라우트는 `proxy.ts`에서 1차 보호, Server Action 내부에서 `verifyAdmin()`으로 2차 보호.

## 운영 메모

- Vercel 빌드 시 `postinstall` 스크립트가 `prisma generate`를 자동 실행함.
- DB 스키마 변경 시: `npx prisma migrate dev --name <설명>` 후 commit + push.
