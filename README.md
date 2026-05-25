# AV Design International — Headless Blog

**Frontend:** Next.js (App Router) + Tailwind CSS  
**Backend:** WordPress (headless, REST API) at `wp-admin.avdesignintl.com`  
**Deploy target:** Vercel  

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `WP_API_URL` | WordPress REST API base URL |
| `REVALIDATION_SECRET` | Shared secret for on-demand ISR cache purge |

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo to [vercel.com/new](https://vercel.com/new).

## Architecture

```
Blaze.ai ──POST──▶ WordPress (wp-admin.avdesignintl.com)
                       │
                  Webhook (POST /api/revalidate)
                       │
                       ▼
Next.js (blog.avdesignintl.com) ──▶ Browser
       │
   ISR fetch via REST API
       │
       ▼
  wp-admin.avdesignintl.com/wp-json/wp/v2/posts
```

## Blaze Integration

1. Create user `blaze-publisher` (Editor role) in WordPress
2. Generate Application Password (Users → Profile)
3. In Blaze.ai → Integrations → WordPress, enter:
   - Site URL: `https://wp-admin.avdesignintl.com`
   - Username: `blaze-publisher`
   - Application Password: (generated above)
4. Posts publish instantly → webhook fires → frontend revalidates
