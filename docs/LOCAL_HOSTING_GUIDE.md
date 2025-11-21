# 🌍 Run NCSKIT 100% Locally (Optional Cloudflare Tunnel)

This guide shows how to run the entire stack on your own machine (no Supabase Cloud). You can keep everything local on `localhost`, or optionally expose it via Cloudflare Tunnel.

## 1. Prerequisites

- Docker & Docker Compose
- Cloudflared installed
- A domain managed by Cloudflare (e.g., `ncskit.org`)

## 2. Start Local Supabase (Self-hosted)

We use a customized docker-compose for Supabase.

1. Generate keys (if not already done):
   - Use a JWT generator or `openssl rand -hex 32` to create `JWT_SECRET`.
   - Use `JWT_SECRET` to sign an `ANON_KEY` and `SERVICE_ROLE_KEY`.

2. Copy `supabase_env.example` → `supabase_env` (file mẫu đã chứa giá trị placeholder cho local: `SUPABASE_PUBLIC_URL=http://localhost:54321`, `SITE_URL=http://localhost:3000`, v.v...).

3. Start Supabase:
   ```powershell
   docker compose -f docker-compose.supabase.yml up -d
   ```

## 3. Start Frontend & R Service (Local-only defaults)

1. Update `frontend/.env.local` (hoặc copy từ `env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8001
   NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8000
   ```

2. Start services:
   ```powershell
   # Terminal 1: Frontend
   cd frontend
   npm run dev

   # Terminal 2: R Analytics
   cd r-analytics
   docker compose up -d
   ```

> 🔁 **Muốn reset toàn bộ stack nhanh?**  
> Chạy `powershell -ExecutionPolicy Bypass -File scripts/reset-local.ps1` để:
> - Stop cả hai docker-compose (Supabase + backend/R).
> - Xóa `.next`, cài lại dependency (có thể thêm `-SkipInstall`).
> - Loại bỏ container frontend cũ (`ncskit-frontend`) chiếm port 3000.
> - Khởi động lại toàn bộ dịch vụ.

## 4. (Optional) Expose via Cloudflare Tunnel

1. Update `config/ncskit-tunnel-config.yml` (already configured).
2. Run tunnel:
   ```bash
   cloudflared tunnel --config config/ncskit-tunnel-config.yml run bce1d1b0-1f68-4b83-a7d8-6aa36095346f
   ```

## 5. Configure Google & LinkedIn OAuth

1. Go to **Google Cloud Console**.
2. Add the **local** redirect URI:
   ```
   http://localhost:54321/auth/v1/callback
   ```
3. If you later use Cloudflare Tunnel, add:
   ```
   https://api.ncskit.org/auth/v1/callback
   ```
4. Repeat the same redirect URLs in LinkedIn Developer Portal.

## 6. Access Your App

- Local-only:
  - App: http://localhost:3000
  - Supabase (Kong): http://localhost:54321
  - Supabase Studio: http://localhost:54323
  - R Analytics: http://localhost:8000
- Tunnel (if enabled):
  - https://ncskit.org / https://api.ncskit.org / https://admin.ncskit.org / https://r.ncskit.org

## Troubleshooting

- **502 Bad Gateway (Tunnel mode):** Check if the local service (Supabase/Frontend) is running on the expected port.
- **Login Loop:** Ensure `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and Supabase `SITE_URL` all point to the SAME origin (localhost vs tunnel). Clear cookies when switching modes.
- **Cần dọn sạch build + khởi động lại?** Dùng script `scripts/reset-local.ps1` để thực hiện tự động thay vì chạy từng lệnh bằng tay.

