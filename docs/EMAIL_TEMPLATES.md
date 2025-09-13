# Email Templates (Shipping Notifications)

Last updated: 2025-09-13

Purpose
- Define a consistent, branded HTML template for shipping emails.
- Document how emails are generated today and how we will migrate to file-based templates when the corporate domain is ready.

Current implementation (today)
- Sender: EMAIL_FROM (fallback retry with "VentHub Test <onboarding@resend.dev>" if domain not verified)
- Generator: shipping-notification Edge Function builds a simple inline HTML string.
- Recipient derivation: Auth Admin API with service-role; no dependency on admin_users view.
- Resend integration: direct POST to https://api.resend.com/emails with RESEND_API_KEY; BCC supported via SHIP_EMAIL_BCC.
- Test flags: EMAIL_TEST_MODE / EMAIL_TEST_TO; NOTIFY_DEBUG for safe server logs.

Planned implementation (file-based templates)
- Template path: templates/email/shipping.html (see placeholder below)
- Placeholders:
  - {{customer_name}}
  - {{order_number}} (pretty format, e.g., #ABCD1234)
  - {{carrier}}
  - {{tracking_number}}
  - {{tracking_url}} (optional)
- Strategy options:
  1) Simple string replace in Edge Function (no new deps)
  2) Tiny template helper (e.g., Mustache) bundled into the function
- Styling: Use inline CSS for email client compatibility. Avoid external CSS.

Testing checklist
- Sandbox: set EMAIL_TEST_MODE=true and EMAIL_TEST_TO=delivered@resend.dev, then trigger shipping.
- Production-like: set EMAIL_TEST_MODE=false and use onboarding@resend.dev until domain is verified.
- Verify in Resend > Emails: check To, Subject, Delivered status.

Migration steps when corporate email is ready
1) Resend > Domains: add and verify domain (SPF/DKIM per Resend instructions)
2) Update environment:
   - EMAIL_FROM="<Brand Name> <no-reply@yourdomain.com>"
   - EMAIL_TEST_MODE=false
3) Optional: switch shipping-notification to load and render templates/email/shipping.html instead of inline HTML.
4) Add brand logo URL and colors to the template (see comments inside HTML file).

Notes
- Keep RESEND_API_KEY only in Supabase Functions env (never in repo).
- Keep the plain-text part (text) in addition to HTML for deliverability and a11y.

Related docs
- docs/DEPLOYMENT.md → Resend env vars and flows
- docs/ROADMAP.md → E‑posta / Bildirim altyapısı
