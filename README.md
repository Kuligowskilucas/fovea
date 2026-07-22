# Fovea

A practice-management system for an optometry clinic: patient records, a structured optometric exam, and prescription printing. Built around the workflow of a single practitioner who does almost everything from her phone, so the interface is mobile-first throughout.

The app is running in production with a real user. This repository holds the application source only. No credentials, patient data, or environment configuration is committed here.

## Features

- Patient records with personal details, contact info, address, legal guardian, and notes.
- Consultations tied to each patient, with history.
- Optometric exam split into blocks: visual acuity, autorefraction, keratometry, retinoscopy, final Rx, and notes.
- Prescriptions with per-eye measurements and a printable receipt, with a header configurable through environment variables.
- Patient search.
- Archiving and restoring via soft delete, with a dedicated screen for archived records.
- Email and password authentication (Laravel Fortify).

## Stack

Backend
- Laravel 13 (PHP 8.3)
- Inertia.js 3
- Laravel Fortify for authentication
- Laravel Wayfinder for typed routes on the frontend
- PostgreSQL

Frontend
- React 19 with TypeScript
- Tailwind CSS 4
- shadcn/ui components (new-york style) on top of Radix UI, Lucide icons
- Vite

Quality
- Pest for tests
- Larastan (PHPStan) for static analysis
- Laravel Pint on the backend, ESLint and Prettier on the frontend

## Running locally

Requirements: PHP 8.3+, Composer, Node 20+, PostgreSQL.

Clone and install dependencies:

```bash
git clone https://github.com/Kuligowskilucas/fovea.git
cd fovea
composer install
npm install
```

Set up the environment:

```bash
cp .env.example .env
php artisan key:generate
```

Point `.env` at PostgreSQL:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=fovea
DB_USERNAME=fovea
DB_PASSWORD=your_password
```

Run the migrations and seed the initial user:

```bash
php artisan migrate --seed
```

`DoctorUserSeeder` creates the user from the `SEED_DOCTOR_*` variables. Without them, it falls back to a development default that must be changed before any real use.

Start the dev environment (server, queue, and Vite in parallel):

```bash
composer dev
```

## Tests and checks

Tests run against PostgreSQL rather than SQLite, because the system uses `ilike` for search. Create a `fovea_testing` database before running them.

```bash
composer test        
composer ci:check    
```

## A few design decisions

Single user, no multi-tenancy. The system serves one practitioner. Instead of generalizing early, the scope was kept deliberately small, and each feature was weighed against real value before being built.

Diopter fields as text, not number. On iOS, `input type="number"` rejects the plus sign, which is a problem when half of the sphere and cylinder values are positive. These fields use `type="text"` with `inputMode="decimal"` and a custom component with a sign toggle.

Typed routes with Wayfinder. Laravel routes are generated as TypeScript functions, so the frontend never builds URLs by hand and a broken route fails at build time.

Soft delete instead of hard delete. Since this is clinical data, nothing is truly removed. Archived records can be restored from a dedicated screen.

Portuguese, mobile-first interface. The whole product was designed for the phone first, from the exam form to the receipt layout.

## Status

In production and under active development. The code is open as a portfolio piece; the production instance and its data are not part of this repository.