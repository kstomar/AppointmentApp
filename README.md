# AppointmentApp

A multi-platform appointment scheduling SaaS that enables businesses to manage bookings while allowing clients to schedule appointments online.

## Architecture

This is a **monorepo** containing three main projects:

| Project | Tech Stack | Directory |
|---------|-----------|-----------|
| **API** | Ruby on Rails 7.1, PostgreSQL, Redis, Sidekiq | `api/` |
| **Web** | React 18, Vite, TypeScript, Tailwind CSS | `web/` |
| **Mobile** | React Native 0.73, TypeScript, NativeWind | `mobile/` |

## Prerequisites

- **Node.js** >= 18
- **Ruby** 3.3.x
- **PostgreSQL** 16+
- **Redis** 7+
- **Docker** & **Docker Compose** (optional, for containerized development)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/kstomar/AppointmentApp.git
cd AppointmentApp

# Copy environment files
cp api/.env.example api/.env
cp web/.env.example web/.env

# Start all services
docker compose up
```

This starts:
- **API** at http://localhost:3000
- **Web** at http://localhost:5173
- **PostgreSQL** at localhost:5432
- **Redis** at localhost:6379

### Manual Setup

#### API (Rails Backend)

```bash
cd api
bundle install
rails db:create db:migrate
rails server  # http://localhost:3000
```

#### Web (React Frontend)

```bash
cd web
npm install
npm run dev   # http://localhost:5173
```

#### Mobile (React Native)

```bash
cd mobile
npm install

# iOS
npx pod-install
npm run ios

# Android
npm run android
```

### Using Start Scripts

```bash
# Start both API and Web in development mode
./start-dev.sh
```

## Project Structure

```
AppointmentApp/
├── api/                    # Rails API backend
│   ├── app/
│   │   ├── controllers/    # API endpoints (api/v1/)
│   │   ├── models/         # ActiveRecord models
│   │   ├── services/       # Business logic
│   │   └── workers/        # Sidekiq background jobs
│   ├── config/             # Rails configuration
│   ├── db/                 # Migrations and schema
│   └── Dockerfile
├── web/                    # React web application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── services/       # API client
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript definitions
│   └── Dockerfile
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── navigation/     # React Navigation config
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API client
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript definitions
│   ├── ios/
│   └── android/
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Full-stack containerization
└── package.json            # Root workspace config
```

## Environment Variables

Each project requires its own `.env` file. See the `.env.example` files in each directory:

- `api/.env.example` - Database, Redis, JWT, payment, and service keys
- `web/.env.example` - API URL configuration
- `mobile/.env.example` - API URL configuration

## Scripts

From the root directory:

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start web dev server |
| `npm run dev:api` | Start Rails API server |
| `npm run dev` | Start all dev servers |
| `npm run build:web` | Build web for production |
| `npm run lint` | Lint web and mobile |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

## API Endpoints

All API endpoints are namespaced under `/api/v1`:

- **Authentication**: `/api/v1/auth/*`
- **Businesses**: `/api/v1/businesses/*`
- **Bookings**: `/api/v1/bookings/*`
- **Public Booking**: `/api/v1/public/businesses/:slug/*`

## External Integrations

| Service | Purpose |
|---------|---------|
| Stripe | Payment processing |
| Razorpay | Payment processing (India) |
| Google Calendar | Calendar synchronization |
| Twilio | SMS/email notifications |
| AWS S3 | File storage |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, branching strategy, and coding conventions.

## License

Private - All rights reserved.
