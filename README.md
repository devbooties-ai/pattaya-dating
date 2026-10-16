# Pattaya Dating Desktop – Cloudflare Pages

Current code: desktop demo v0.6 (not a real dating service yet).

Production URL: https://pattaya-dating-demo.pages.dev/

## First-time setup
1. Create a **separate private GitHub repository**, e.g. `pattaya-dating`, and upload the contents of this folder **at repository root**. Do not upload this folder itself as an extra directory.
2. In Cloudflare dashboard, create an API Token with **Account / Cloudflare Pages / Edit** permission; scope to the appropriate account. Do not paste the token into chat or code.
3. Find your Cloudflare account ID.
4. In the GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**. Create `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. GitHub Actions → Deploy Pattaya Dating to Cloudflare Pages → Run workflow (or push a commit to `main`). Verify the run succeeds and the page is correct.

## Ongoing updates
Edit files inside `public/` and commit to `main`: GitHub Actions publishes them to the existing `pattaya-dating-demo` Cloudflare Pages project. The URL stays unchanged.

## Important
The project is a demonstration with fake profiles, local-only conversations and gifts. It has no live auth, payments, or video calling. The production site is publicly accessible unless you protect it using Cloudflare Access. A `noindex` meta tag is not a security barrier.
