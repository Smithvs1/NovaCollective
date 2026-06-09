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
| Product Page Preview | `products.html` | Placeholder approved-member shopping/vendor resource page | None |

## Public URLs

- Production website URL: Not published yet.
- Publishing: Use the **Publish tab** to publish the project and receive the live URL.
- API endpoints used by the static website:
  - `POST tables/applications` — create a new professional application.
  - `GET tables/applications` — available for listing applications if an admin/listing page is added later.
  - `GET tables/applications/{record_id}` — available for single application review if needed later.
  - `PATCH tables/applications/{record_id}` — available for status updates if an admin workflow is added later.

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

- RESTful Table API using relative endpoints such as `tables/applications`.

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

## Features Not Yet Implemented

- Real password-protected access for approved members. A static website cannot securely enforce member-only access without an external authentication or membership service.
- Live e-commerce checkout. The product page currently supports placeholder vendor/affiliate links, not direct cart/checkout functionality.
- Payment collection for the refundable $500 deposit. This would require a third-party payment provider link or hosted checkout page.
- Admin dashboard for reviewing applications and changing applicant statuses.
- Automated email notifications after application submission.
- Final vendor/affiliate product links and product photography.
- Final selected Louisville address and exact location details.

## Recommended Next Steps

1. Replace placeholder product links in `products.html` with vendor, affiliate, or associate URLs.
2. Add final professional photography/renderings once suites and interior selections are finalized.
3. Connect deposit payment CTA to a third-party hosted checkout link after approval workflow is established.
4. Add an admin-only workflow through an external tool or authenticated platform if private applicant review is required.
5. Decide how approved members will access the product page: private shared link, membership platform, or password-protected hosting.
6. Publish the site using the **Publish tab** when ready to go live.

## File Structure

```text
index.html
perks.html
apply.html
design-examples.html
products.html
README.md
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
