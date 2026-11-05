# SARA INTARCH — Independent edition

This project keeps the existing React/Vite website and its current pages/components. The Base44 SDK and Vite plugin have been removed. Supabase is used for authentication, database records and media storage; the frontend can be hosted on Netlify independently.

## 1. Create the Supabase backend

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase-schema.sql`, and run it.
3. In **Authentication → Users**, create the studio owner's account.
4. Promote that account to admin by running the final SQL statement in `supabase-schema.sql`, replacing `OWNER_EMAIL_HERE` with the owner's email.
5. In **Project Settings → API**, copy the Project URL and anon/publishable key.

## 2. Configure the website

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Install dependencies with `npm install`.
4. Start locally with `npm run dev` or create a production build with `npm run build`.

## 3. Deploy on Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Add the two `VITE_SUPABASE_*` environment variables in Netlify → Site configuration → Environment variables.
- Redeploy after setting the variables.

`public/_redirects` contains the SPA fallback required for React Router.

## Important migration notes

- No Base44 SDK, Base44 Vite plugin, Base44 API URL or Base44 app ID is needed.
- The API layer at `src/api/platformClient.js` connects the existing UI to Supabase. The visible website components remain in place while authentication, database records and media storage are handled independently.
- Existing Base44 database content and uploaded files are not automatically copied. Add content through the admin area or import it separately after the Supabase project is configured.
- Admin access is granted through Supabase `app_metadata.role = admin`, which users cannot edit themselves.
- Configure email confirmation, password recovery redirect URLs, and Google OAuth (if needed) in Supabase Authentication settings.
