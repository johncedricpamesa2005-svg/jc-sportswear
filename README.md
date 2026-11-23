# JC Sportswear - Fixed Full Version

## What was fixed
- Removed **API Data** from the main navigation.
- The storefront no longer calls `/api/me`, `/api/login`, `/api/register`, or `/api/firebase-login`.
- Google login uses Firebase Authentication directly. No Express backend is required for login.
- Email registration/login works with localStorage for this frontend-only version.
- After Google login, the app returns cleanly to the Home page without breaking the UI.
- Existing wishlist and My Orders functions remain stored locally.
- Buy Now creates an order and opens My Orders.
- Product details modal works.
- Shop search, sorting, category filters, wishlist and buy actions work.
- Home sport buttons now open Shop with the selected category.
- Bootstrap JavaScript was added so the mobile navigation toggle works.
- PWA service-worker caching was changed so Vite development is not affected by stale cache.
- Production PWA uses a new cache version and network-first handling for the app files.

## Run
Open a terminal in this folder:

```bash
npm install
npm run dev
```

Then open the localhost address shown by Vite.

## Important for Google Login
In Firebase Authentication, make sure Google Sign-In is enabled and your development domain is authorized (normally `localhost`).

## Production/PWA
```bash
npm run build
npm run preview
```

The service worker is only registered in the production build, so `npm run dev` will not get stuck using old cached files.

## Backend
The `backend/` folder is kept in the project for reference, but the fixed storefront does not depend on it.
