# 🍗 ChicknChunks – Food Ordering & Delivery Management System

## Description

ChicknChunks is a full-stack restaurant food ordering and delivery management system built with React and Laravel. The platform provides customer ordering, guest checkout, order history, order tracking, admin management, rider delivery management, menu and category management, deals, inventory management, staff management, real-time chat, notifications, and role-based security.

## Features

### Customer
- Browse menu
- Categories
- Deals
- Add to cart
- Guest checkout
- Customer authentication
- Order history
- Individual order tracking
- Delivery tracking
- Chat with Admin/Rider
- Notifications

### Admin
- Admin dashboard
- Order management
- Rider assignment
- Menu management
- Category management
- Deal management
- Inventory management
- Staff management
- Customer management
- Order notifications
- Chat management

### Rider
- Rider authentication
- Assigned deliveries
- Delivery status management
- Customer/order information
- Order history
- Customer/Admin chat
- Delivery completion
- Rider availability management

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Vanilla CSS

### Backend
- Laravel
- PHP
- REST API

### Database
- MySQL / SQLite

### Authentication
- Laravel Sanctum
- Role-based authorization

## Security

ChicknChunks incorporates key security practices across the application stack:

- **Authentication**: Bearer token authentication via Laravel Sanctum for API endpoints.
- **Role-based authorization**: Dedicated middleware (`EnsureUserIsAdmin`, `EnsureUserIsCustomer`, `EnsureUserIsRider`) protecting privileged routes.
- **API protection**: Secured REST API endpoints with request authentication and route protection.
- **Input validation**: Structured request validation across controller endpoints.
- **Rate limiting**: API request rate limiting to prevent brute force and denial of service attempts.
- **IDOR protection**: Ownership checks on user orders, addresses, and chat threads.
- **Secure file uploads**: File type and size validation on product image uploads.
- **XSS protection**: Security headers added via custom HTTP middleware (`AddSecurityHeaders`).
- **Secure session handling**: Encrypted session cookies and secure token invalidation on 401 response.
- **Environment variable protection**: Sensitive keys, database credentials, and secrets isolated in `.env` files.

## Installation

### Prerequisites
- Node.js (v18+)
- PHP (v8.2+)
- Composer
- MySQL or SQLite

### 1. Repository Setup
```bash
git clone <repository-url>
cd chicknchunks-food-delivery
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### 3. Frontend Setup
```bash
# In the project root directory
npm install
cp .env.example .env
npm run dev
```

## Environment Configuration

Users must create their own `.env` files for both frontend and backend configurations using `.env.example` templates. Never commit `.env` files containing actual passwords, API keys, or database credentials to version control.

## Project Structure

```
chicknchunks-web/
├── backend/                  # Laravel Backend API
│   ├── app/                  # Controllers, Models, Middleware
│   ├── bootstrap/            # Application bootstrap
│   ├── config/               # Framework & service configurations
│   ├── database/             # Migrations, Seeders, Factories
│   ├── public/               # Public web server root
│   ├── resources/            # Views & raw assets
│   ├── routes/               # API & Web routes
│   ├── storage/              # File storage & logs
│   ├── tests/                # Feature & Unit tests
│   ├── .env.example          # Backend environment template
│   ├── composer.json         # PHP dependencies
│   └── artisan               # Laravel CLI tool
├── public/                   # Frontend static assets & food images
├── src/                      # React Frontend Source Code
│   ├── assets/               # Image assets & icons
│   ├── components/           # React components (Admin, Rider, Chat, Cart, etc.)
│   ├── context/              # Global Application State Context
│   ├── data/                 # Fallback menu data
│   ├── lib/                  # API client & helper utilities
│   ├── App.jsx               # Main React Application
│   └── main.jsx              # Application entry point
├── .env.example              # Frontend environment template
├── index.html                # Vite HTML entry point
├── package.json              # Node dependencies
├── vite.config.js            # Vite build configuration
└── README.md                 # Project documentation
```

## Project Status

Active development

## License

License: Not yet specified.
