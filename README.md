# Nutrix — Phase 2: Frontend deployment to Railway

## What's in this drop

```
frontend/Dockerfile         (new — Next.js standalone build)
frontend/next.config.js     (replaces existing — adds output: 'standalone')
```

## Step 1 — Apply the patch locally

```bash
cd ~/Projects/carepilot
tar -xzf ~/Downloads/nutrix-phase2-frontend-deploy.tar.gz
```

This creates `frontend/Dockerfile` (new file) and overwrites `frontend/next.config.js` (the existing one is identical except for the new `output: 'standalone'` line).

Verify:

```bash
cat frontend/Dockerfile | head -5
cat frontend/next.config.js
```

You should see the Dockerfile starting with `FROM node:20-alpine AS deps` and the next.config.js containing `output: 'standalone'`.

## Step 2 — Test the build locally (optional, 2 minutes)

This catches any next.config.js issues before pushing:

```bash
cd ~/Projects/carepilot/frontend
npm run build
ls .next/standalone
```

You should see `.next/standalone/server.js` exist. If the build fails, paste the error.

## Step 3 — Commit and push

```bash
cd ~/Projects/carepilot
git add frontend/Dockerfile frontend/next.config.js
git commit -m "Phase 2: Add Dockerfile and standalone output for frontend Railway deploy"
```

Then **push via GitHub Desktop** (terminal git auth still broken).

## Step 4 — Create the second Railway service

In your Railway dashboard:

1. Go to the **peaceful-sparkle** project
2. Click the **+ Create** button (or right-click on the canvas) → **Empty Service**, NOT "GitHub Repo"
   (We'll connect the repo manually so we can configure the Dockerfile path before the first build)
3. Click on the new empty service tile
4. Settings tab → Source section → click **Connect Repo**
5. Select `Mr-XMS/Nutrix`
6. Branch: `main`
7. **Don't set a Root Directory** (leave empty)
8. Scroll to the **Build** section in the right sidebar
9. Find **"Dockerfile Path"** and set it to: `frontend/Dockerfile`
10. Save

## Step 5 — Add frontend environment variables

Click the **Variables** tab on the new service. Click **Raw Editor** and paste:

```
NEXT_PUBLIC_API_URL=https://carepilot-production-e8de.up.railway.app/api/v1
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

Click **Update Variables**.

## Step 6 — Trigger a build

Railway should auto-deploy when env vars are added. If not, Deployments tab → ⋯ menu → Redeploy.

The build will take 2-4 minutes (npm install + Next.js build is slower than NestJS). Watch for:

- ✅ All builder stages succeed
- ✅ "Compiled successfully" from Next.js
- ✅ Container starts with `Listening on port 3000` (or whatever Railway injects)

## Step 7 — Generate a public domain for the frontend

After the deploy succeeds and the service goes Online:

1. Settings → Networking → **Generate Domain**
2. Copy the URL — something like `nutrix-frontend-production-xxxx.up.railway.app`

## Step 8 — Update backend CORS

Now that you have a frontend URL, lock down the backend CORS to only allow that origin:

1. Go to the Carepilot service → Variables tab
2. Edit `CORS_ORIGIN`
3. Change from `*` to your new frontend URL: `https://nutrix-frontend-production-xxxx.up.railway.app`
4. Save

The backend will redeploy automatically. Wait ~30 seconds.

## Step 9 — Test the full stack

Open your frontend URL in a browser. You should see:
- Nutrix login page rendered from the production frontend
- Network requests in DevTools going to the production backend (`carepilot-production-e8de.up.railway.app`)
- Successfully register a new test org → dashboard renders → all working

## Troubleshooting

**Build fails with `output: 'standalone'` not recognized**: Old Next.js version. Check `frontend/package.json` — should be Next.js ≥12. We're on 14.2.5 so this won't happen.

**Build succeeds, container starts, but healthcheck fails**: Same problem we just escaped on the backend. The default Next.js standalone server listens on `localhost`, not `0.0.0.0`. The Dockerfile sets `HOSTNAME=0.0.0.0` to fix this. If it's still happening, check the deploy logs to confirm the env var is being read.

**CORS errors after going to production**: The browser's DevTools console will show "blocked by CORS policy". Means the `CORS_ORIGIN` on the backend doesn't match the origin the browser is sending. Update CORS_ORIGIN in the backend Variables tab to match your frontend URL exactly (no trailing slash).

**`NEXT_PUBLIC_API_URL` not being picked up**: This var is baked into the JS bundle at *build time*, not runtime. If you change it after the build, you need to rebuild. Railway → Deployments → Redeploy.
