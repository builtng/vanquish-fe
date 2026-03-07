# Vanquish Therapy Management System

A comprehensive therapy management system with Next.js frontend and Laravel backend API.

## Project Structure

```
vanquish/
├── app/                    # Next.js frontend application
├── backend/                # Laravel API backend
├── contexts/               # React contexts
├── lib/                    # Utility libraries (API service)
└── public/                 # Static assets
```

## Features

### Frontend (Next.js)
- ✅ **Admin Dashboard**: Real-time stats and management hub.
- ✅ **Trainee Recruitment Flow**: 4-stage automated application system.
- ✅ **Client Management**: Full CRM with consultation history.
- ✅ **Training Counsellor Management**: Track modalities, availability, and clinical hours.
- ✅ **Booking System**: Integration with Trafft for seamless scheduling.
- ✅ **Activity Logging**: Comprehensive audit trail for all admin actions.
- ✅ **Company Branding**: Customizable logos, headers, and reporting templates.

### Backend (Laravel)
- ✅ **RESTful API**: Secure Laravel 12 API with Sanctum.
- ✅ **Automation Engine**: Queued jobs for email triggers and status updates.
- ✅ **Webhooks**: Deep integration with JotForm, HireVire, and Trafft.
- ✅ **Email System**: Rich HTML dynamic templates for all candidate touchpoints.
- ✅ **Security**: CORS, rate limiting, and role-based access control (RBAC).
- ✅ **SEO**: Optimized metadata and semantic structure for public pages.

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vanquish
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations:
```bash
php artisan migrate
```

7. Create admin user:
```bash
php artisan tinker
```
```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@vanquish.com',
    'password' => \Hash::make('admin123'),
    'role' => 'admin'
]);
```

8. Start backend server:
```bash
php artisan serve
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Credentials

- Email: `admin@vanquish.com`
- Password: `admin123`

**⚠️ Change these credentials in production!**

## API Documentation

### Authentication

All API endpoints (except login/register) require authentication via Bearer token.

**Login:**
```bash
POST /api/login
Body: { "email": "admin@vanquish.com", "password": "admin123" }
Response: { "user": {...}, "token": "..." }
```

**Get Current User:**
```bash
GET /api/user
Headers: { "Authorization": "Bearer {token}" }
```

### Main Endpoints

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `GET /api/pending-matches` - Get pending matches
- `POST /api/matches` - Assign client to TC
- `GET /api/training-counsellors` - List TCs
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Book consultation
- `GET /api/activity-logs` - View activity logs

See `backend/README.md` for complete API documentation.

## Development

### Backend Development

```bash
cd backend
php artisan serve
```

### Frontend Development

```bash
npm run dev
```

### Running Tests

Backend:
```bash
cd backend
php artisan test
```

## Production Deployment

See `PRODUCTION_SETUP.md` for detailed production deployment instructions.

## Security Features

- ✅ Laravel Sanctum token authentication
- ✅ CORS configuration
- ✅ Rate limiting (60 requests/minute)
- ✅ Input validation
- ✅ SQL injection protection (Eloquent ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Password hashing (bcrypt)
- ✅ Secure token storage

## Technology Stack

### Frontend
- Next.js 15
- React 19
- Tailwind CSS 4
- Lucide React (Icons)

### Backend
- Laravel 12
- Laravel Sanctum (Authentication)
- MySQL
- Eloquent ORM

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
