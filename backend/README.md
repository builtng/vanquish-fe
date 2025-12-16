# Vanquish Backend API

Laravel 12 API backend for the Vanquish therapy management system.

## Features

- **Authentication**: Laravel Sanctum for API token authentication
- **Security**: CORS enabled, rate limiting, input validation
- **Models**: Clients, Trainee Counsellors, Consultations, Activity Logs, Intake Forms
- **RESTful API**: Full CRUD operations for all resources

## Installation

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vanquish
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. Run migrations:
```bash
php artisan migrate
```

6. Seed test admin users:
```bash
php artisan db:seed
```

This will create:
- **Admin User**: `admin@vanquish.com` / `admin123`
- **Staff User**: `staff@vanquish.com` / `staff123`

Alternatively, you can create users manually using tinker:
```bash
php artisan tinker
```
```php
$user = \App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@vanquish.com',
    'password' => \Hash::make('admin123'),
    'role' => 'admin'
]);
```

7. Start the server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/logout` - Logout (requires auth)
- `GET /api/user` - Get current user (requires auth)

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/{id}` - Get client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `GET /api/pending-matches` - Get pending matches
- `POST /api/matches` - Assign client to TC

### Trainee Counsellors
- `GET /api/training-counsellors` - List TCs
- `POST /api/training-counsellors` - Create TC
- `GET /api/training-counsellors/{id}` - Get TC
- `PUT /api/training-counsellors/{id}` - Update TC
- `DELETE /api/training-counsellors/{id}` - Delete TC

### Consultations
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Create consultation
- `POST /api/consultations/{id}/complete` - Complete consultation
- `POST /api/consultations/{id}/cancel` - Cancel consultation
- `POST /api/consultations/{id}/reschedule` - Reschedule consultation

### Activity Logs
- `GET /api/activity-logs` - List activity logs

### Intake Forms
- `POST /api/client-intake` - Submit client intake form
- `POST /api/tc-intake` - Submit TC intake form

## Security Features

- **CORS**: Configured for frontend domain
- **Rate Limiting**: Applied to API routes
- **Input Validation**: All inputs validated
- **Token Authentication**: Sanctum tokens for API access
- **SQL Injection Protection**: Eloquent ORM with parameter binding
- **XSS Protection**: Laravel's built-in protection

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Run `php artisan view:cache`
6. Set up proper database credentials
7. Configure CORS allowed origins
8. Set up SSL/TLS certificates
9. Configure web server (Nginx/Apache)
10. Set up queue workers for background jobs (if needed)

## Environment Variables

Key environment variables:
- `APP_ENV` - Application environment (local/production)
- `APP_DEBUG` - Debug mode (true/false)
- `APP_URL` - Application URL
- `DB_*` - Database configuration
- `SANCTUM_STATEFUL_DOMAINS` - CORS allowed domains

## Testing

Run tests:
```bash
php artisan test
```

## License

Proprietary - All rights reserved
