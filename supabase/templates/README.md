# Supabase Auth Email Templates — Vistāra Krafts Atelier

This directory contains the production-grade, responsive, luxury HTML email templates for Supabase Auth, styled to Vistāra Krafts brand guidelines ("Apple, Elevated").

All templates feature:
- 100% cross-client compatibility (Gmail Web/iOS/Android, Apple Mail, Outlook, Yahoo).
- High-contrast typography with system font fallbacks (`Playfair Display` + `Plus Jakarta Sans`).
- Vistāra Krafts atelier gold accents (`#d4af37`), obsidian backgrounds (`#0d0d12`), and subtle bordered cards (`#faf9f6`).
- Preheader inbox snippet text.
- Clear security badges, statutory GST & logistics badges.
- Native Supabase GoTrue variables (`{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`, `{{ .Data }}`).

---

## 1. Password Changed Notification (Primary)
- **File:** [`password_changed.html`](./password_changed.html)
- **Dashboard Location:** **Authentication → Emails → Security Notifications → Password Changed** (or **Email Templates**)
- **Subject:** `Security Alert: Your Vistāra Krafts password was changed`
- **When sent:** Automatically dispatched immediately after a patron's password has been updated.
- **Key Variables Used:**
  - `{{ .Email }}` — Patron's email address
  - `{{ .SiteURL }}` — Storefront domain (`https://vistarakrafts.com`)
  - `{{ .Data.name }}` / `{{ .Data.full_name }}` — Patron's display name

---

## 2. Reset Password / Recovery
- **File:** [`recovery.html`](./recovery.html)
- **Dashboard Location:** **Authentication → Email Templates → Reset Password**
- **Subject:** `Reset Your Password • Vistāra Krafts Atelier`
- **When sent:** When a patron requests a password reset from the login screen or via `supabase.auth.resetPasswordForEmail()`.
- **Key Variables Used:**
  - `{{ .ConfirmationURL }}` — Action button link to verify token and redirect to set new password
  - `{{ .Token }}` — 6-digit one-time recovery code
  - `{{ .Email }}` — Patron's email address
  - `{{ .SiteURL }}` — Storefront domain

---

## 3. Confirm Signup
- **File:** [`confirmation.html`](./confirmation.html)
- **Dashboard Location:** **Authentication → Email Templates → Confirm signup**
- **Subject:** `Confirm Your Vistāra Krafts Account`
- **When sent:** When a patron registers a new account.
- **Key Variables Used:**
  - `{{ .ConfirmationURL }}` — Action button link to verify account
  - `{{ .Token }}` — 6-digit OTP code

---

## 4. Magic Link / Passwordless Login
- **File:** [`magic_link.html`](./magic_link.html)
- **Dashboard Location:** **Authentication → Email Templates → Magic Link**
- **Subject:** `Your Vistāra Krafts Access Link`
- **When sent:** When a user requests passwordless sign-in via email.
- **Key Variables Used:**
  - `{{ .ConfirmationURL }}` — Instant login link
  - `{{ .Token }}` — One-time code

---

## 5. Change Email Address
- **File:** [`email_change.html`](./email_change.html)
- **Dashboard Location:** **Authentication → Email Templates → Change Email Address**
- **Subject:** `Confirm Your New Email Address • Vistāra Krafts`
- **When sent:** When a patron updates their account email address.

---

## How to Apply in Supabase

### Option A: Via Supabase Dashboard (Recommended)
1. Go to your **Supabase Dashboard**: [https://supabase.com/dashboard/project/niamxrskqhjvzwxomxrx](https://supabase.com/dashboard/project/niamxrskqhjvzwxomxrx).
2. In the left navigation, click **Authentication**, then select **Email Templates** (or **Emails**).
3. Select the template you wish to update (e.g., **Password Changed** or **Reset Password**).
4. Enter the **Subject** provided above.
5. In the **Body (HTML)** editor, select all and paste the entire contents of the corresponding `.html` file.
6. Click **Save Changes**.

### Option B: Via Supabase CLI (`config.toml`)
If using local development with the Supabase CLI, add the paths to your `supabase/config.toml`:
```toml
[auth.email.notification.password_changed]
enabled = true
subject = "Security Alert: Your Vistāra Krafts password was changed"
content_path = "./supabase/templates/password_changed.html"

[auth.email.template.recovery]
subject = "Reset Your Password • Vistāra Krafts Atelier"
content_path = "./supabase/templates/recovery.html"

[auth.email.template.confirmation]
subject = "Confirm Your Vistāra Krafts Account"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.magic_link]
subject = "Your Vistāra Krafts Access Link"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.email_change]
subject = "Confirm Your New Email Address • Vistāra Krafts"
content_path = "./supabase/templates/email_change.html"
```
