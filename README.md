# Paperpigeon

Paperpigeon is a private shared feed app for exactly two people. Users can sign up, create one private feed, invite one other person, and post text messages that are visible for a limited time.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Supabase Auth + Postgres (via RLS)

## Project structure

```text
.
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── src
    ├── app
    │   ├── app
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── login
    │   │   └── page.tsx
    │   ├── page.tsx
    │   └── signup
    │       └── page.tsx
    ├── components
    │   ├── auth-form.tsx
    │   └── feed-app.tsx
    └── lib
        ├── constants.ts
        └── supabase
            ├── client.ts
            ├── middleware.ts
            └── server.ts
```

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://urmniwtllbvqfyyrvygy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_NteuFeIdasGpt2Qm5mhBXA_SWFcVwGT
```

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Product behavior implemented

- `/` landing page with product positioning and auth CTAs
- `/login` and `/signup` with email/password auth
- Protected `/app` route (unauthenticated users redirected to `/login`)
- Authenticated users redirected from `/login` and `/signup` to `/app`
- Feed bootstrap flow:
  - if no feed membership, show “Create Feed” empty state
  - creating feed inserts into `feeds`, then `feed_members`
- Post flow:
  - insert posts into `posts` with `feed_id`, `author_id`, and `content`
  - fetch only posts from user feed
  - fetch only posts newer than last 24 hours
  - newest-first ordering
- Sign out support
- Lightweight invite placeholder via feed ID display

> TTL is configured in `src/lib/constants.ts` (`POST_TTL_HOURS`) and defaults to `24`.

## Supabase settings required

In Supabase Auth settings:

1. Enable Email provider (email/password).
2. Set site URL for your environment:
   - Local: `http://localhost:3000`
   - Production: your Vercel URL
3. Add redirect URL(s):
   - `http://localhost:3000/app`
   - `https://<your-production-domain>/app`
4. Ensure RLS policies allow authenticated users to:
   - read feeds they belong to
   - insert into `feed_members` for allowed cases
   - insert and read posts in their feed

## Vercel deployment notes

1. Import repository to Vercel.
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy.
4. In Supabase Auth settings, add your Vercel production URL and `/app` redirect URL.

The app is production-ready for v1 and does not include schema migrations or service-role usage.
