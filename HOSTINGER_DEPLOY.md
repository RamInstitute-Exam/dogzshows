# Deploy Frontend to Hostinger via GitHub Connect

Your frontend is a **static export** of Next.js (`output: 'export'`) that builds to
`frontend/out/`. It talks to a separate live API at `https://api.juzdog.co/api/v1`,
so on Hostinger we only need to **serve the static files** with a small Node server
(`serve`) and wire up GitHub Connect for auto-deploy.

## 1. Prerequisites
- The `frontend/` folder must be pushed to a GitHub repository.
- Your Hostinger plan must support **Node.js / GitHub Connect** (Business or higher,
  or a VPS).

## 2. Connect GitHub
1. Hostinger hPanel → **Websites** → your site → **Advanced** → **GitHub**.
2. Click **Connect GitHub**, authorize, and pick your repository.
3. Set the branch to deploy (usually `main`).

## 3. Build & Run settings (Hostinger panel)
Because your app lives in the `frontend/` subfolder, every command is prefixed with
`cd frontend`.

| Setting            | Value                                                       |
|--------------------|-------------------------------------------------------------|
| **Repository**     | `your-org/your-repo`                                        |
| **Branch**         | `main`                                                      |
| **Build command**  | `cd frontend && npm install && npm run build`               |
| **Output directory** | `frontend/out`                                           |
| **Install command**| `cd frontend && npm install`                                |
| **Start command**  | `cd frontend && npm run start:hostinger`                   |
| **Node.js version**| `20.x` (or latest LTS)                                      |

> `start:hostinger` runs `serve out -l ${PORT:-3000}`. Hostinger injects `PORT`,
> so the static site is served on the port Hostinger expects.

## 4. Environment variables (set in Hostinger panel)
`.env*` files are gitignored, so these MUST be added in the Hostinger
**Environment / Variables** section — they get baked into the build:

```
NEXT_PUBLIC_API_URL=https://api.juzdog.co/api/v1
NEXT_PUBLIC_UPLOAD_URL=https://s3.ap-south-1.amazonaws.com/namma-orru-foods/images
NEXT_PUBLIC_APP_NAME=JuzDog
NEXT_PUBLIC_APP_VERSION=1.0.0
```

> Only `NEXT_PUBLIC_*` vars are embedded in a static export. The API itself stays
> on `api.juzdog.co` (your Express backend) — no changes needed there.

## 5. Deploy
1. Click **Deploy** in the Hostinger GitHub panel.
2. Watch the build log. You should see:
   - `next build` → exports to `frontend/out`
   - `node fix-rsc.js` → flattens nested RSC payload paths
   - `serve out -l <PORT>` → serves the site
3. Once green, visit your Hostinger domain.

## 6. Verify
- Open the site, open DevTools → Network.
- Log in / register — requests should go to `https://api.juzdog.co/api/v1/...`.
- If you see CORS or connection errors, confirm `NEXT_PUBLIC_API_URL` is set in the
  Hostinger panel and that your Express API allows the Hostinger origin.

## 7. Auto-deploy
After the first successful deploy, every `git push` to `main` triggers a rebuild
automatically via GitHub Connect. No extra CI file is required.

---

## Notes / gotchas
- **Don't switch to `next start`** — your config uses `output: 'export'`, so there is
  no Node server bundle. `serve` is the correct way to host a static export.
- **`fix-rsc.js`** was originally written for Firebase Hosting; the path-flattening
  it does is also needed on Hostinger's static file serving, so keep it.
- **Custom image loader** (`./src/lib/image-loader.ts`) works fine with static export.
- If you later need server-side rendering / API routes inside Next.js, you must
  remove `output: 'export'` and use Hostinger's Node.js runtime with `next start`
  instead — that is a bigger migration (see backend team).
