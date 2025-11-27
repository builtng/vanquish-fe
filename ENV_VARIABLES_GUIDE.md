# Environment Variables Guide

Complete guide for setting up environment variables for both frontend and backend in production.

## Frontend Environment Variables

Create `.env.local` file in the **root directory** (same level as `package.json`):

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api

# Stripe Configuration (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Production publishable key from Stripe Dashboard
```

### For Vercel Deployment:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add both variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.your-domain.com/api`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (from Stripe Dashboard)

### For Local Development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Test key from Stripe Dashboard
```

---

## Backend Environment Variables

Create `.env` file in the `backend/` directory:

### Application Configuration

```env
APP_NAME=Vanquish
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.your-domain.com
```

**Generate APP_KEY:**

```bash
cd backend
php artisan key:generate
```

### Database Configuration

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vanquish_prod
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_password
```

### CORS Configuration

```env
CORS_ALLOWED_ORIGINS=https://vanquish0.vercel.app,https://vanquish.gen6ixx.com,http://vanquish.gen6ixx.com
```

**Note:** Add all your frontend domains separated by commas (no spaces).

### Sanctum Configuration (Authentication)

```env
SANCTUM_STATEFUL_DOMAINS=vanquish0.vercel.app,vanquish.gen6ixx.com
```

**Note:** Add all your frontend domains separated by commas (no spaces). Do NOT include `http://` or `https://`.

### Stripe Configuration

```env
STRIPE_KEY=pk_live_...          # Production publishable key
STRIPE_SECRET=sk_live_...        # Production secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret from Stripe Dashboard
```

**Getting Stripe Keys:**

1. Go to Stripe Dashboard → Developers → API keys
2. Switch to "Live mode" (toggle in top right)
3. Copy "Publishable key" → `STRIPE_KEY`
4. Copy "Secret key" → `STRIPE_SECRET`
5. Go to Developers → Webhooks → Add endpoint
6. Set endpoint URL: `https://api.your-domain.com/api/webhooks/stripe`
7. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
8. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### Mail Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io          # Or your SMTP server
MAIL_PORT=2525                       # Or your SMTP port (587 for TLS, 465 for SSL)
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls                  # tls or ssl
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Common SMTP Providers:**

- **Mailtrap (Testing):** `smtp.mailtrap.io`, port `2525`
- **SendGrid:** `smtp.sendgrid.net`, port `587`
- **Mailgun:** `smtp.mailgun.org`, port `587`
- **Gmail:** `smtp.gmail.com`, port `587` (requires app password)

### Session Configuration

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
```

### Logging Configuration

```env
LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DAILY_DAYS=14
```

### Queue Configuration (if using queues)

```env
QUEUE_CONNECTION=database
# Or use Redis:
# QUEUE_CONNECTION=redis
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=null
# REDIS_PORT=6379
```

### File Storage Configuration

```env
FILESYSTEM_DISK=local
# Or use S3:
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=
# AWS_USE_PATH_STYLE_ENDPOINT=false
```

---

## Production Checklist

### Backend (.env)

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` generated and set
- [ ] `APP_URL` set to production API URL
- [ ] Database credentials configured
- [ ] `CORS_ALLOWED_ORIGINS` includes all frontend domains
- [ ] `SANCTUM_STATEFUL_DOMAINS` includes all frontend domains
- [ ] Stripe production keys configured
- [ ] Stripe webhook endpoint configured and secret set
- [ ] Mail/SMTP configured
- [ ] Session encryption enabled
- [ ] Logging configured

### Frontend (.env.local or Vercel)

- [ ] `NEXT_PUBLIC_API_URL` set to production API URL
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set to production key

---

## Security Notes

1. **Never commit `.env` or `.env.local` files** - they should be in `.gitignore`
2. **Use strong passwords** for database and SMTP
3. **Keep keys secret** - never expose them in client-side code (except `NEXT_PUBLIC_*` variables)
4. **Rotate keys regularly** - especially if compromised
5. **Use HTTPS** in production for all API calls
6. **Enable CORS** only for your domains
7. **Use environment-specific keys** - different keys for dev/staging/production

---

## Testing Environment Variables

### Test Backend Connection:

```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan migrate:status
```

### Test Frontend Connection:

1. Check browser console for API errors
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Test login functionality
4. Check Network tab for API calls

### Test Stripe:

1. Use test keys in development
2. Test payment flow with test card: `4242 4242 4242 4242`
3. Verify webhook receives events in Stripe Dashboard

---

## Common Issues

### CORS Errors

- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Check that domain matches exactly (including `https://`)
- Clear browser cache

### Authentication Issues

- Verify `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
- Check that domain matches exactly (without `http://` or `https://`)
- Ensure cookies are being sent (check browser DevTools → Network)

### Stripe Payment Issues

- Verify keys match environment (test vs live)
- Check webhook endpoint is accessible
- Verify webhook secret matches Stripe Dashboard
- Check Stripe Dashboard → Events for errors

### Database Connection Issues

- Verify database credentials
- Check database server is accessible
- Ensure database exists
- Check firewall rules allow connection

---

## Example Production Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.vanquish.gen6ixx.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### Backend (.env)

```env
APP_NAME=Vanquish
APP_ENV=production
APP_KEY=base64:AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz=
APP_DEBUG=false
APP_URL=https://api.vanquish.gen6ixx.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vanquish_prod
DB_USERNAME=vanquish_user
DB_PASSWORD=SecurePassword123!

CORS_ALLOWED_ORIGINS=https://vanquish0.vercel.app,https://vanquish.gen6ixx.com
SANCTUM_STATEFUL_DOMAINS=vanquish0.vercel.app,vanquish.gen6ixx.com

STRIPE_KEY=pk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_SECRET=sk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@vanquish.gen6ixx.com
MAIL_FROM_NAME="Vanquish"

SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

LOG_CHANNEL=daily
LOG_LEVEL=error
```

---

## Quick Reference

| Variable                             | Frontend | Backend | Required    | Notes                                     |
| ------------------------------------ | -------- | ------- | ----------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | ✅       | ❌      | Yes         | API base URL                              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅       | ❌      | Yes         | Stripe publishable key                    |
| `APP_ENV`                            | ❌       | ✅      | Yes         | `production`                              |
| `APP_DEBUG`                          | ❌       | ✅      | Yes         | `false`                                   |
| `APP_KEY`                            | ❌       | ✅      | Yes         | Generated with `php artisan key:generate` |
| `APP_URL`                            | ❌       | ✅      | Yes         | Backend API URL                           |
| `DB_*`                               | ❌       | ✅      | Yes         | Database credentials                      |
| `CORS_ALLOWED_ORIGINS`               | ❌       | ✅      | Yes         | Comma-separated frontend domains          |
| `SANCTUM_STATEFUL_DOMAINS`           | ❌       | ✅      | Yes         | Comma-separated frontend domains          |
| `STRIPE_KEY`                         | ❌       | ✅      | Yes         | Stripe publishable key (same as frontend) |
| `STRIPE_SECRET`                      | ❌       | ✅      | Yes         | Stripe secret key                         |
| `STRIPE_WEBHOOK_SECRET`              | ❌       | ✅      | Yes         | Stripe webhook signing secret             |
| `MAIL_*`                             | ❌       | ✅      | Recommended | Email configuration                       |
