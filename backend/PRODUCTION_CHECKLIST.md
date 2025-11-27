# Production Deployment Checklist

## Pre-Deployment Security

### Environment Configuration
- [ ] Copy `.env.example` to `.env` and configure all values
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY` using `php artisan key:generate`
- [ ] Configure `APP_URL` to production domain (`http://vanquish.gen6ixx.com`)

### Database
- [ ] Configure production database credentials
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed initial data if needed: `php artisan db:seed`
- [ ] Test database connection
- [ ] Set up database backups

### Session & Security
- [ ] Set `SESSION_DRIVER=database`
- [ ] Set `SESSION_ENCRYPT=true`
- [ ] Set `SESSION_SECURE_COOKIE=true`
- [ ] Set `SESSION_HTTP_ONLY=true`
- [ ] Set `SESSION_SAME_SITE=lax` or `strict`

### CORS Configuration
- [ ] Set `CORS_ALLOWED_ORIGINS` to production frontend:
  - `https://vanquish0.vercel.app`
  - `http://vanquish.gen6ixx.com`
  - `https://vanquish.gen6ixx.com`

### Sanctum Configuration
- [ ] Set `SANCTUM_STATEFUL_DOMAINS` to production domains:
  - `vanquish0.vercel.app`
  - `vanquish.gen6ixx.com`

### Logging
- [ ] Set `LOG_CHANNEL=daily`
- [ ] Set `LOG_LEVEL=error`
- [ ] Set `LOG_DAILY_DAYS=14`
- [ ] Verify log directory is writable: `storage/logs`

### Mail Configuration
- [ ] Configure SMTP settings
- [ ] Set `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME`
- [ ] Test email sending

### Stripe Configuration
- [ ] Set production Stripe keys (`STRIPE_KEY`, `STRIPE_SECRET`)
- [ ] Configure webhook endpoint in Stripe dashboard
- [ ] Set `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- [ ] Test webhook signature verification

### File Storage
- [ ] Configure `FILESYSTEM_DISK` (local or S3)
- [ ] Set up symbolic link: `php artisan storage:link`
- [ ] Verify storage directory permissions
- [ ] Consider using S3 for production file storage

## Server Configuration

### PHP Configuration
- [ ] PHP version 8.1 or higher
- [ ] Required PHP extensions installed:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
- [ ] Increase `upload_max_filesize` and `post_max_size` if needed
- [ ] Set appropriate `memory_limit`

### Web Server
- [ ] Configure web server (Apache/Nginx)
- [ ] Set document root to `public/` directory
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up proper virtual host
- [ ] Configure URL rewriting

### Permissions
- [ ] Set storage directory permissions: `chmod -R 775 storage bootstrap/cache`
- [ ] Set correct ownership: `chown -R www-data:www-data storage bootstrap/cache`
- [ ] Ensure `.env` file is not publicly accessible

## Application Setup

### Dependencies
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run `npm install --production` (if needed)
- [ ] Build assets: `npm run build` (if needed)

### Optimization
- [ ] Cache configuration: `php artisan config:cache`
- [ ] Cache routes: `php artisan route:cache`
- [ ] Cache views: `php artisan view:cache`
- [ ] Optimize autoloader: `composer dump-autoload --optimize`

### Queue & Jobs
- [ ] Configure queue driver: `QUEUE_CONNECTION=database` or `redis`
- [ ] Set up queue worker: `php artisan queue:work`
- [ ] Configure supervisor or systemd for queue workers
- [ ] Set up failed job handling

## Security Verification

### Authentication
- [ ] Test login functionality
- [ ] Test 2FA setup and verification
- [ ] Verify password requirements enforced
- [ ] Test registration (if enabled)

### Authorization
- [ ] Test admin-only endpoints
- [ ] Test staff-only endpoints
- [ ] Verify unauthorized access is blocked
- [ ] Test role-based permissions

### API Security
- [ ] Verify CORS headers are correct
- [ ] Test rate limiting
- [ ] Verify security headers are present
- [ ] Test HTTPS redirect
- [ ] Verify webhook signature validation

### File Uploads
- [ ] Test file upload with valid files
- [ ] Test file upload with invalid files (should be rejected)
- [ ] Verify file size limits
- [ ] Verify file type validation

## Monitoring & Maintenance

### Error Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag, etc.)
- [ ] Configure log monitoring
- [ ] Set up alerts for critical errors

### Performance Monitoring
- [ ] Set up application performance monitoring
- [ ] Monitor database query performance
- [ ] Monitor API response times

### Backup Strategy
- [ ] Set up automated database backups
- [ ] Set up file storage backups
- [ ] Test backup restoration process
- [ ] Document backup procedures

### Updates
- [ ] Schedule regular dependency updates
- [ ] Monitor security advisories
- [ ] Plan for Laravel security updates

## Testing

### Functional Testing
- [ ] Test all API endpoints
- [ ] Test authentication flows
- [ ] Test file uploads
- [ ] Test payment processing
- [ ] Test email sending

### Security Testing
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test authorization bypass attempts
- [ ] Test rate limiting

### Performance Testing
- [ ] Load testing
- [ ] Stress testing
- [ ] Database query optimization

## Documentation

### API Documentation
- [ ] Document all API endpoints
- [ ] Document authentication requirements
- [ ] Document error responses
- [ ] Document rate limits

### Deployment Documentation
- [ ] Document deployment process
- [ ] Document rollback procedure
- [ ] Document environment variables
- [ ] Document server requirements

## Post-Deployment

### Verification
- [ ] Verify all endpoints are accessible
- [ ] Verify HTTPS is working
- [ ] Verify CORS is configured correctly
- [ ] Test from production frontend
- [ ] Monitor error logs

### Monitoring
- [ ] Monitor application logs
- [ ] Monitor server resources
- [ ] Monitor database performance
- [ ] Monitor API usage

### Communication
- [ ] Notify team of deployment
- [ ] Document any issues encountered
- [ ] Update deployment documentation

## Emergency Procedures

### Rollback Plan
- [ ] Document rollback steps
- [ ] Test rollback procedure
- [ ] Have backup of previous version ready

### Incident Response
- [ ] Document incident response procedure
- [ ] Have contact information ready
- [ ] Know how to disable features if needed

