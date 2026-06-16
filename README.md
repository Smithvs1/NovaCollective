# NOVA Collective Website

## Project Goal
NOVA Collective is a modern, luxury salon suite website designed to attract established Louisville, KY beauty, wellness, tattoo, spa, and personal care professionals who may want to rent private studio pods/suites.

The website positions NOVA Collective as an exclusive, membership-based private studio collective with founding member advantages, Louisville-area location interest, suite customization inspiration, and a professional application flow.

## Currently Completed Features

- **Modern responsive multi-page website** with luxury black, warm neutral, and gold styling.
- **Uploaded logo integration** using `images/nova-logo.png`, enlarged in the header with a white/high-contrast treatment for better visibility on black.
- **Home page hero section** redesigned in a reference-style split layout with the uploaded hero video on the left, headline/copy on the right, tighter spacing below the header, a black background, and an oversized “Not Everyone Gets In” statement across the lower hero.
- **Louisville location section** using the uploaded map image.
- **Club Experience section** with the provided NOVA Collective positioning copy plus an editorial photo grid of salon professionals at work.
- **Founding Member Advantage section** with:
  - Priority Selection
  - Early Pricing
  - Founding Status
- **Secure Your Place section** with Founding Member benefits and refundable $500 deposit messaging.
- **Perks page** explaining why a private salon suite is better than a traditional chair rental, now with professional service photography.
- **Apply to Join page** with a professional application form and visual applicant sidebar.
- **Application form persistence** using the RESTful Table API and the `applications` data model.
- **Design Examples page** showing suite customization inspiration such as chairs, mirrors, shelving, massage tables, paint colors, tattoo setup, kiosks, floating drawers, floating shelves, lighting, and decor, plus service-based imagery for tattoo, nail, and spa professionals.
- **Approved Product Page Preview** for future vendor, affiliate, or associate product links.
- **Mobile navigation** with accessible menu toggle.
- **Responsive layout** for desktop, tablet, and mobile.
- **Console testing completed** for all main HTML pages with no console errors captured.

## Functional Entry URIs

| Page | Path | Purpose | Parameters |
|---|---|---|---|
| Home | `index.html` | Main marketing landing page | None |
| Location Section | `index.html#location-section` | Louisville area location interest section | URL hash only |
| Club Experience | `index.html#club-experience` | Private studio collective positioning | URL hash only |
| Founding Advantage | `index.html#founding-advantage` | Founding member benefit cards | URL hash only |
| Secure Place | `index.html#secure-place` | Deposit and secure spot CTA | URL hash only |
| Perks | `perks.html` | Benefits of suite rental vs. chair rental | None |
| Apply | `apply.html` | Founding Member application form | None |
| Design Examples | `design-examples.html` | Public suite design inspiration gallery | None |
| Interest Success | `interest-success.html` | Interest list confirmation page | None |
| Deposit | `deposit.html` | Approved member deposit payment page (private link) | None |
| Deposit Success | `deposit-success.html` | Post-payment confirmation page | None |
| Product Page Preview | `products.html` | Placeholder approved-member shopping/vendor resource page | None |

## Public URLs

- Production website: `https://www.novacollective.vip`
- Deployment platform: Vercel
- API routes are served as Vercel Serverless Functions from the `/api` directory.

## Data Models, Structures, and Storage Services

### Table: `applications`

Used by `apply.html` and `js/main.js` to store application submissions through the RESTful Table API.

Fields:

- `id` — unique application id.
- `first_name` — applicant first name.
- `last_name` — applicant last name.
- `email` — applicant email address.
- `phone` — applicant phone number.
- `business_name` — applicant business name.
- `specialty` — professional specialty. Options include Hair Stylist, Barber, Esthetician, Nail Tech, Massage Therapist, Lash Tech, Tattoo Artist, Reiki / Wellness, and Other.
- `portfolio` — Instagram or portfolio URL.
- `clientele_size` — applicant’s active clientele description.
- `message` — optional notes.
- `status` — application review status. Default submitted status is `new`.
- `created_display` — ISO timestamp of submission.

Storage service:

- Supabase PostgreSQL database via `@supabase/supabase-js` in Vercel serverless functions (`/api/applications`).

### Table: `interest_list`

Used by `index.html` and `js/main.js` to store interest list signups via `/api/interest`.

Fields:

- `id` — unique signup id.
- `name` — person's name (optional).
- `email` — email address (required).
- `specialty` — professional specialty (optional).
- `created_at` — timestamp of signup.

Storage service:

- Supabase PostgreSQL database via `@supabase/supabase-js` in Vercel serverless functions (`/api/interest`).

## Assets

- `images/nova-logo.png` — uploaded NOVA Collective logo.
- `images/floor-plan.jpg` — uploaded salon suite concept/floor plan image.
- `images/louisville-map.jpg` — uploaded Louisville-area map image.
- `images/pro-hairstylist.jpg` — professional hairstylist/salon service photo.
- `images/pro-barber.jpg` — professional barber service photo.
- `images/pro-nail-tech.jpg` — professional nail technician photo.
- `images/pro-lash.webp` — professional lash service photo.
- `images/pro-esthetician.jpg` — professional esthetician/spa service photo.
- `images/pro-tattoo.jpg` — professional tattoo artist photo.
- `images/pro-massage.jpg` — professional massage/spa treatment photo.
- `videos/nova-hero.mp4` — uploaded hero video used in the homepage top section.

## Production Deployment Setup

### Prerequisites

- [Vercel](https://vercel.com) account (free tier works)
- [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account with API keys

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run the following migration:

```sql
create table applications (
  id uuid default gen_random_uuid() primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  business_name text,
  specialty text,
  portfolio text,
  clientele_size text,
  message text,
  status text default 'new',
  created_display timestamptz
);
```

3. Also run this SQL to create the interest list table:

```sql
create table interest_list (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text not null,
  specialty text,
  created_at timestamptz default now()
);
```

4. Copy the **Project URL** and **service_role key** from **Settings > API**

### 2. Vercel Deployment

1. Import this repository into Vercel
2. Add the following **Environment Variables** in Vercel project settings:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_KEY` — your Supabase service_role key
   - `STRIPE_SECRET_KEY` — your Stripe secret key (starts with `sk_`)
   - `STRIPE_PUBLISHABLE_KEY` — your Stripe publishable key (starts with `pk_`)
3. Deploy the project

### 3. Domain Configuration

1. Go to Vercel project > **Settings > Domains**
2. Add `www.novacollective.vip`
3. Add the CNAME record Vercel provides to the DNS settings for `novacollective.vip` at your domain registrar
4. Also add `novacollective.vip` (apex) and configure redirect to `www`

#### GoDaddy DNS Troubleshooting

If you see `ERR_NAME_NOT_RESOLVED` for `www.novacollective.vip`:

1. Log in to [GoDaddy](https://dcc.godaddy.com) and go to **My Products > DNS**
2. Delete any existing A or CNAME records for `www`
3. Add a **CNAME** record: Name = `www`, Value = `cname.vercel-dns.com` (or the value Vercel shows in your domain settings), TTL = 600
4. For the apex domain (`novacollective.vip`), add an **A** record pointing to `76.76.21.21` (Vercel's IP)
5. Wait 5–30 minutes for DNS propagation, then verify with `dig www.novacollective.vip`

### 4. Stripe Configuration

1. In your Stripe Dashboard, ensure the checkout session settings allow the `success_url` and `cancel_url` domains (`www.novacollective.vip`)
2. The deposit amount is $500.00 USD, collected via Stripe Checkout

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/applications` | Submit a new professional application (stored in Supabase) |
| POST | `/api/create-checkout-session` | Create a Stripe Checkout session for the $500 deposit |
| POST | `/api/interest` | Save an interest list signup (stored in Supabase `interest_list` table) |

## Features Not Yet Implemented

- Real password-protected access for approved members. A static website cannot securely enforce member-only access without an external authentication or membership service.
- Admin dashboard for reviewing applications and changing applicant statuses.
- Automated email notifications after application submission.
- Final vendor/affiliate product links and product photography.
- Final selected Louisville address and exact location details.

## Recommended Next Steps

1. Replace placeholder product links in `products.html` with vendor, affiliate, or associate URLs.
2. Add final professional photography/renderings once suites and interior selections are finalized.
3. Add an admin-only workflow through an external tool or authenticated platform if private applicant review is required.
4. Decide how approved members will access the product page: private shared link, membership platform, or password-protected hosting.
5. Set up Stripe webhook for `checkout.session.completed` to auto-update application status in Supabase.

## File Structure

```text
index.html
perks.html
apply.html
deposit.html
deposit-success.html
interest-success.html
design-examples.html
products.html
README.md
package.json
vercel.json
api/
  applications.js
  create-checkout-session.js
  interest.js
css/
  styles.css
js/
  main.js
images/
  nova-logo.png
  floor-plan.jpg
  louisville-map.jpg
  pro-hairstylist.jpg
  pro-barber.jpg
  pro-nail-tech.jpg
  pro-lash.webp
  pro-esthetician.jpg
  pro-tattoo.jpg
  pro-massage.jpg
videos/
  nova-hero.mp4
```
