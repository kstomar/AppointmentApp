# Contributing to AppointmentApp

## Git Branching Strategy

We use a **feature branch workflow** with the following conventions:

### Branch Naming

| Branch Type | Pattern | Example |
|------------|---------|---------|
| Feature | `feature/<ticket-id>-<description>` | `feature/TOM-42-booking-flow` |
| Bug Fix | `fix/<ticket-id>-<description>` | `fix/TOM-50-login-error` |
| Hotfix | `hotfix/<description>` | `hotfix/payment-timeout` |
| Release | `release/<version>` | `release/1.0.0` |

### Branch Flow

```
main (production)
 └── feature/TOM-XX-description
 └── fix/TOM-XX-description
```

1. Create a feature branch from `main`
2. Develop and commit changes
3. Open a Pull Request against `main`
4. Pass CI checks and code review
5. Squash merge into `main`

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature or fix) |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |

### Scopes

| Scope | Description |
|-------|-------------|
| `api` | Rails backend |
| `web` | React web app |
| `mobile` | React Native app |
| `infra` | Infrastructure, Docker, CI |

### Examples

```
feat(api): add booking cancellation endpoint
fix(web): resolve date picker timezone issue
chore(infra): update Docker base images
docs: update README with setup instructions
```

## Development Setup

### Prerequisites

- Node.js >= 18
- Ruby 3.3.x
- PostgreSQL 16+
- Redis 7+

### Getting Started

1. Clone the repository
2. Copy environment files:
   ```bash
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   cp mobile/.env.example mobile/.env
   ```
3. Start services with Docker:
   ```bash
   docker compose up
   ```
   Or manually start each service (see [README.md](README.md)).

## Code Style

### Ruby (API)

- Follow the [Ruby Style Guide](https://rubystyle.guide/)
- Rubocop is configured for linting: `bundle exec rubocop`
- Use `snake_case` for methods, variables, and file names
- Use `CamelCase` for classes and modules

### TypeScript (Web & Mobile)

- ESLint is configured for linting: `npm run lint`
- Prettier is configured for formatting: `npm run format`
- Use `PascalCase` for React components and type/interface names
- Use `camelCase` for functions, variables, and file names (except components)
- Use TypeScript strict mode

### General

- Keep functions small and focused
- Write meaningful variable and function names
- Prefer composition over inheritance
- Follow the DRY (Don't Repeat Yourself) principle

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Ensure all CI checks pass (lint, test, build)
3. Write a clear PR description explaining **what** and **why**
4. Reference the Linear ticket (e.g., `Closes TOM-42`)
5. Request review from at least one team member
6. Address review feedback promptly
7. Squash merge once approved

## Testing

### API

```bash
cd api
bundle exec rspec              # Run all tests
bundle exec rspec spec/models  # Run model tests only
```

### Web

```bash
cd web
npm test                       # Run all tests
npm run lint                   # Lint check
```

### Mobile

```bash
cd mobile
npm test                       # Run all tests
npm run lint                   # Lint check
```

## Directory Structure Conventions

When adding new features, follow these patterns:

### API

- Controllers: `api/app/controllers/api/v1/<resource>_controller.rb`
- Models: `api/app/models/<resource>.rb`
- Services: `api/app/services/<feature>_service.rb`
- Workers: `api/app/workers/<task>_worker.rb`
- Tests: `api/spec/<type>/<resource>_spec.rb`

### Web

- Pages: `web/src/pages/<PageName>.tsx`
- Components: `web/src/components/<ComponentName>.tsx`
- Services: `web/src/services/<service>.ts`
- Types: `web/src/types/<domain>.ts`

### Mobile

- Screens: `mobile/src/screens/<category>/<ScreenName>.tsx`
- Navigation: `mobile/src/navigation/<Navigator>.tsx`
- Services: `mobile/src/services/<service>.ts`
- Types: `mobile/src/types/<domain>.ts`
