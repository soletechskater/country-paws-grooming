# Country Paws Grooming

A premium, mobile-first grooming website with a live Supabase booking flow.

## Features

- Premium responsive landing page
- Service selection and availability calendar
- Customer booking form with dog details
- Supabase-backed appointments and availability
- Email magic-link authentication for customers
- Admin dashboard with appointment calendar and availability controls
- Review submission workflow

## Setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env` and add your Supabase project URL and anon key.
4. Serve the project with a local web server. For example:

```bash
npx serve .
```

For the static version, add the same values to `config.js` based on `config.example.js`.

5. Add the owner email to `ADMIN_EMAILS` in `app.js`, or update the value in the admin panel configuration.

## Supabase authentication

Enable Email provider and Magic Link in **Authentication → Providers**. Add your deployed site URL to **Authentication → URL Configuration → Redirect URLs**.

The public anon key is safe to use in the browser when Row Level Security is enabled. Never commit a Supabase service-role key.
