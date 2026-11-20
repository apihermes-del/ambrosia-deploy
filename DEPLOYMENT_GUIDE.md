# Ambrosia Bakery Order Operations Platform - Deployment & Supabase Setup Guide

This platform is 100% free under the Supabase and Vercel free tiers. Follow this 5-minute setup to connect your new Supabase project and deploy on Vercel.

---

## 1. Supabase Setup (Database & Real-time)

1. Go to [supabase.com](https://supabase.com) and create or log in to your dedicated project account.
2. Click **New Project** and name it `ambrosia-bakery-ops`. Set a database password.
3. Once created, click on **SQL Editor** from the left navigation.
4. Copy the entire contents of [`supabase_schema.sql`](file:///Users/claude/Documents/Gemini%20Projects/Ambrosia%20Antigravity%20Customer%20Care/supabase_schema.sql) and paste into the editor, then click **Run**.
   - This creates all tables (`orders`, `order_items`, `kitchens`, `pickup_locations`, `delivery_roster`, `user_profiles`), enums, and activates real-time broadcasts.
5. In Supabase, go to **Project Settings -> API**:
   - Copy **Project URL**
   - Copy **anon / public key**
6. In this project repository, create or update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## 2. Setting Up Phone OTP / Auth (Optional / Recommended)

In your Supabase project under **Authentication -> Providers**:
- **Email**: Enabled by default (works with password or magic links).
- **Phone**: Supabase provides free trial SMS or integration with Twilio/Fast2SMS/MessageBird for India phone numbers.

---

## 3. Deploy to Vercel (100% Free)

1. Push this repository to your separate GitHub account:
   ```bash
   git add .
   git commit -m "Ambrosia Phase 1 Bakery Operations Platform"
   git branch -M main
   git remote add origin https://github.com/<your-new-account>/ambrosia-bakery-ops.git
   git push -u origin main
   ```
2. Log into [vercel.com](https://vercel.com) with your separate account and click **Add New... -> Project**.
3. Select your `ambrosia-bakery-ops` GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.
   - Vercel will give you a live production URL (e.g. `https://ambrosia-bakery-ops.vercel.app`) that staff can open instantly on desktop and mobile phones.

---

## 4. How Staff Use the System on Mobile

- On iPhones: Open Safari, tap **Share -> Add to Home Screen**.
- On Android: Open Chrome, tap **Menu -> Add to Home Screen**.
- It installs as a full-screen app icon for delivery drivers and kitchen staff.
