# Production Setup Guide

This guide covers setting up both the frontend and backend for production deployment.

## Backend Setup (Laravel)

### 1. Environment Configuration

Create `.env` file in `backend/` directory:

```env
APP_NAME=Vanquish
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your_db_host
DB_PORT=3306
DB_DATABASE=vanquish_prod
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
```

### 2. Generate Application Key

```bash
cd backend
php artisan key:generate
```

### 3. Run Migrations

```bash
php artisan migrate --force
```

### 4. Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 5. Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 6. Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    root /path/to/vanquish/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### Apache Configuration

Ensure `.htaccess` exists in `backend/public/`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 7. SSL/TLS Setup

Use Let's Encrypt or your SSL provider:

```bash
certbot --nginx -d api.your-domain.com
```

## Frontend Setup (Next.js)

### 1. Environment Variables

Create `.env.local` in root directory:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

### 2. Build for Production

```bash
npm run build
```

### 3. Start Production Server

```bash
npm start
```

### 4. Or Deploy to Vercel/Netlify

#### Vercel Deployment

1. Connect your GitHub repository
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy

#### Netlify Deployment

1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variable: `NEXT_PUBLIC_API_URL`

## Security Checklist

### Backend Security

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Keep Laravel and dependencies updated
- [ ] Set proper file permissions
- [ ] Enable firewall rules
- [ ] Set up regular backups
- [ ] Use database encryption at rest
- [ ] Implement API rate limiting per user
- [ ] Set up monitoring and logging

### Frontend Security

- [ ] Use HTTPS
- [ ] Implement Content Security Policy (CSP)
- [ ] Sanitize user inputs
- [ ] Validate all API responses
- [ ] Store tokens securely (httpOnly cookies preferred)
- [ ] Implement proper error handling
- [ ] Use environment variables for API URLs
- [ ] Enable CORS only for your domain
- [ ] Set up proper headers (X-Frame-Options, etc.)

## Database Setup

### MySQL Configuration

```sql
CREATE DATABASE vanquish_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vanquish_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON vanquish_prod.* TO 'vanquish_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backup Strategy

Set up automated backups:

```bash
# Daily backup script
mysqldump -u vanquish_user -p vanquish_prod > backup_$(date +%Y%m%d).sql
```

## Monitoring

### Recommended Tools

- **Application Monitoring**: Sentry, Bugsnag
- **Server Monitoring**: New Relic, Datadog
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Log Management**: Loggly, Papertrail

## Performance Optimization

### Backend

- Enable OPcache
- Use Redis for caching
- Set up queue workers
- Optimize database queries
- Use CDN for static assets

### Frontend

- Enable Next.js Image Optimization
- Use CDN for assets
- Implement code splitting
- Optimize bundle size
- Enable compression (gzip/brotli)

## Backup and Recovery

1. **Database Backups**: Daily automated backups
2. **File Backups**: Regular storage backups
3. **Code Backups**: Version control (Git)
4. **Test Recovery**: Regularly test restore procedures

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review security advisories
- Monitor error logs
- Check performance metrics
- Review user activity logs
- Update SSL certificates

## Support

For issues or questions, contact the development team.

