# Deployment

```
Martechdevs Website/          <- this repo, github.com/mmfaizr/martechdevs-website
├── martechdevs-web/          -> the site. Vercel, auto-deploys on push to main
├── chatwoot-livechat-integration/
│                             -> the chat backend. Render (claychat)
└── assets/                   -> source art, not served
```

---

## 1. Site (Vercel)

Push to `main` and Vercel builds it. There is no separate deploy step.

```bash
git add -A
git commit -m "your message"
git push origin main
```

Takes about a minute. Confirm it actually shipped rather than assuming:

```bash
curl -s https://www.martechdevs.com/ | grep -c "something you just changed"
```

> **The Vercel project is not under the `faizur-5913` login.** That account has
> two teams, Faizur and Unefi, and martechdevs is in neither. The site deploys
> purely from the GitHub push, so the Vercel dashboard is only needed for build
> logs or project settings.

---

## 2. Chat backend (Render)

**Status: down.** `claychat-api.onrender.com` returns 503. That is also why the
live site's console shows CORS errors — a 503 page carries no CORS headers, so
the browser reports the failure as a CORS problem. Nothing to configure; the
service needs to come back up.

The host the widget actually calls is **`claychat-api.onrender.com`**.
(`claychat.onrender.com`, which this file used to name, 404s.)

> **The `claychat` git remote no longer exists locally.** This repository was
> rebuilt in August 2026 after its `.git` was lost, and only `origin` was
> restored — `git remote -v` shows one remote. Add it back before pushing the
> backend:
>
> ```bash
> git remote add claychat git@github.com:mmfaizr/claychat.git
> ```
>
> Note also that `chatwoot-livechat-integration/` has no `.git` of its own; it
> is tracked inside this repository, so both remotes push from here rather than
> from that subdirectory.

Manual deploy: Render dashboard -> `claychat` -> Manual Deploy -> Deploy latest
commit.

---

## 3. Chat widget

Built separately, then copied into the site's public directory:

```bash
cd chatwoot-livechat-integration/frontend
npm run build
cp dist/martech-chat.* ../../martechdevs-web/public/chat/
```

Then commit and push as in section 1.

---

## 4. Booking

**`https://cal.com/team/martechdevs/discovery`** — Discovery Call, 30 minutes,
on the **martechdevs team**, not a personal calendar. Who takes the call is a
team-membership setting in Cal.com, not something baked into the code.

It appears in two places:

- the booking section's embed and its fallback link — `BOOKING_URL` in
  `martechdevs-web/src/components/Footer.tsx`
- the chat widget's book-a-call action — the `calLink` default in
  `martechdevs-web/src/components/MartechChat.tsx`

Change both together, or they will offer different calls.

> **Do not go back to YouCanBookMe.** Its embed does not render inside a
> third-party iframe: the document loads, the app never paints, and the card is
> a blank white pane. Reproduced across all four of their documented URL
> variants (`noframe`, `skipHeaderFooter`, both, neither), while the same URL
> opened directly works fine. Their session cookies carry no `SameSite=None`,
> so they are withheld once framed. It is not fixable from our side and fails
> the same way in Safari, which has blocked third-party storage for years.

If the provider changes again, check the calendar **paints** inside an iframe at
the card's real size — not merely that the frame fires a load event. That
distinction is exactly what let a blank booking section ship.

---

## 5. Environment variables

Set in each platform's own dashboard, and deliberately **not listed here**: this
repository is public, and an inventory of which service holds which secret is a
map worth handing nobody. The authoritative list is the environment tab of each
service.

- **Vercel** — the chat API base URL.
- **Render (claychat)** — database, cache, model API key, Slack credentials.

Local secrets stay out of git: `chatwoot-livechat-integration/.env` is ignored
by that directory's own `.gitignore`. Keep it that way.

---

## 6. Links

- Vercel dashboard — https://vercel.com/dashboard
- Render dashboard — https://dashboard.render.com
- Cal.com — https://app.cal.com
- Supabase — https://supabase.com/dashboard
- Upstash — https://console.upstash.com
