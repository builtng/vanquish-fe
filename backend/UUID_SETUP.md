# UUID Setup Guide

This guide explains how UUIDs are generated and used throughout the application.

## Overview

All `clients` and `training_counsellors` records now have UUIDs for use in API routing and frontend navigation. UUIDs are automatically generated when new records are created, and existing records can have UUIDs generated using the provided command.

## Features

1. **Automatic UUID Generation**: New records automatically get UUIDs when created via the model's `boot()` method
2. **Route Model Binding**: Models use UUIDs for route model binding with fallback to legacy IDs
3. **Migration Support**: Migrations ensure all existing records have UUIDs
4. **Command Tool**: Artisan command to generate UUIDs for any missing records

## Usage

### Generate UUIDs for All Records

To generate UUIDs for all records that don't have them:

```bash
php artisan uuid:generate
```

### Generate UUIDs for Specific Table

To generate UUIDs for a specific table:

```bash
# For clients only
php artisan uuid:generate --table=clients

# For trainee counsellors only
php artisan uuid:generate --table=training_counsellors
```

### Run Migrations

The migrations will automatically:
1. Add UUID columns if they don't exist
2. Generate UUIDs for all existing records
3. Make UUID columns NOT NULL

```bash
php artisan migrate
```

## Model Configuration

Both `Client` and `TrainingCounsellor` models:

- Automatically generate UUIDs on creation
- Use UUIDs for route model binding
- Fall back to legacy IDs (`client_id` or `tc_id`) for backward compatibility

## API Routes

API routes automatically resolve models by UUID:

- `/api/clients/{client}` - Resolves by UUID (falls back to client_id)
- `/api/training-counsellors/{tc}` - Resolves by UUID (falls back to tc_id)

## Frontend

The frontend has been updated to use UUIDs for all routing:
- Client detail pages: `/dashboard/client-details/{uuid}`
- Trainee counsellor detail pages: `/dashboard/training-counsellors/details/{uuid}`

All links use the pattern: `{entity}.uuid || {entity}.id` for backward compatibility.

## Database Schema

### Clients Table
- `uuid` column: UUID, unique, NOT NULL
- Auto-generated on record creation

### Trainee Counsellors Table
- `uuid` column: UUID, unique, NOT NULL
- Auto-generated on record creation

## Troubleshooting

### Missing UUIDs

If you find records without UUIDs:

1. Run the migration: `php artisan migrate`
2. Or run the command: `php artisan uuid:generate`

### Route Not Found

If routes aren't resolving:

1. Ensure UUIDs exist: `php artisan uuid:generate`
2. Check model route binding is configured correctly
3. Verify the UUID format matches Laravel's UUID validation

## Files Modified

- `app/Models/Client.php` - Added UUID generation and route binding
- `app/Models/TrainingCounsellor.php` - Added UUID generation and route binding
- `app/Console/Commands/GenerateUuids.php` - Command to generate UUIDs
- `database/migrations/2025_11_25_073805_change_clients_id_to_uuid.php` - Clients UUID migration
- `database/migrations/2025_11_25_073806_change_training_counsellors_id_to_uuid.php` - TCs UUID migration
- `database/migrations/2025_11_25_074608_ensure_all_records_have_uuids.php` - Ensure all records have UUIDs

