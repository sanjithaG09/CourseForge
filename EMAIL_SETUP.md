# CourseForge — Email Setup Guide

## How Emails Work in This Project

Emails are sent via **Gmail + Nodemailer**. Two types are triggered automatically:

| Trigger | Email Sent |
|---|---|
| User creates an account | OTP verification email |
| User clicks "Forgot Password" | OTP password-reset email |

---

## Step-by-Step Gmail Setup

### 1. Enable 2-Step Verification
Go to → https://myaccount.google.com/security  
Enable **2-Step Verification** if not already on.

### 2. Generate an App Password
Go to → https://myaccount.google.com/apppasswords  
- App: **Mail**  
- Device: **Other** (type "CourseForge")  
- Click **Generate**  
- Copy the 16-character password shown

### 3. Update `.env`
Open the `.env` file in the project root:

```
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcdefghijklmnop    ← paste the 16-char app password, no spaces
```

That's it. Restart the backend (`npm start`) and emails will work.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Email not configured" in console | `EMAIL_USER` or `EMAIL_PASS` is empty/missing in `.env` |
| "Invalid login" error | App password is wrong — regenerate at myaccount.google.com/apppasswords |
| OTP not arriving | Check spam folder; Gmail may delay first sends |
| 2FA not available | You need a regular Gmail account, not a Workspace account with restrictions |

---

## What Each Email Looks Like

- **Signup OTP** — Subject: *"Verify your CourseForge account"*  
  Sent when a new user registers. Contains a 6-digit code valid for 10 minutes.

- **Forgot Password OTP** — Subject: *"Reset your CourseForge password"*  
  Sent when a user requests a password reset. Code valid for 10 minutes.

---

## Using a Different Email Provider

Replace the transporter in `utils/emailService.js`:

```js
// SendGrid example
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
});
```
