# ShelfIt web shelf: install notes

Adds a private page at `shelfitapp.com/shelf` where a signed-in person sees,
searches, opens, adds and deletes the links on their shelf.

## What's in the box

`app/shelf/` is one self-contained folder. Nothing outside it needs to change
for the page to work.

## Steps

1. Copy the `shelf` folder into your web project's `app/` folder, so you end up with
   `app/shelf/page.tsx`.
2. The page reads the same two settings your public collection page already uses:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Check they exist in
   `.env.local` (for running on your Mac) and in Vercel (Project Settings, Environment Variables).
3. `@supabase/supabase-js` must be in your `package.json`. It already is if your
   collection page works.
4. Try it on your Mac: `npm run dev`, then open http://localhost:3000/shelf and sign in.
5. **Before you deploy, check your database security** (see below).
6. Commit and push. Vercel redeploys. Then try https://shelfitapp.com/shelf.

## Check your database security first (important)

This page talks to Supabase from the browser, exactly like the phone app. What stops
one person seeing another's links is Row Level Security (RLS), not the page.

- In Supabase, open Advisors, then Security Advisor, and fix anything it flags.
- Confirm RLS is switched on for `saves`, `links`, `collections`, `collection_saves`,
  `alerts` and `users`.
- Test with two accounts: sign in as each and check you only ever see your own links.

## Optional: a link from the landing page

In `app/page.tsx`, add this below the download button:

```tsx
<a href="/shelf" style={{ color: '#181C14', fontWeight: 600, marginBottom: '2rem' }}>
  Open your shelf
</a>
```

## Not included in this version

Creating an account, password reset, collections, Discover and anything involving
payments. People do those in the app.
