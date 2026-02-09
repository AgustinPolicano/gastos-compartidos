# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Docker Setup - 2026-02-09

### Added - Dockerization & Deployment

#### Docker Configuration
- **Production Dockerfiles:**
  - `backend/Dockerfile` - Multi-stage build with Node 22 Alpine
  - `frontend/Dockerfile` - Angular build + Nginx static server
  - `backend/.dockerignore` and `frontend/.dockerignore`
  
- **Development Dockerfiles:**
  - `backend/Dockerfile.dev` - Hot reload with tsx watch
  - `frontend/Dockerfile.dev` - Hot reload with ng serve

- **Docker Compose:**
  - `docker-compose.yml` - Production orchestration (Backend + Frontend + PostgreSQL)
  - `docker-compose.dev.yml` - Development with hot reload and volume mounts

- **Nginx Configuration:**
  - `frontend/nginx.conf` - SPA routing, gzip, caching, security headers

#### Scripts & Automation
- `deploy.sh` - Automated deployment script with:
  - Environment validation
  - Container cleanup
  - Image building
  - Service startup
  - Health checks verification
  
- `test-local.sh` - API testing script that:
  - Checks backend/frontend running
  - Tests all API endpoints
  - Validates responses with jq

#### Documentation
- `DEPLOYMENT.md` - Complete deployment guide:
  - Local development setup
  - VPS deployment instructions
  - Nginx reverse proxy configuration
  - SSL setup with Let's Encrypt
  - Troubleshooting guide
  - Monitoring and backups

- `README.md` - Main project documentation:
  - Features overview
  - Tech stack details
  - Quick start guide
  - Database schema
  - API endpoints reference
  - Project structure

- `DOCKER_SETUP.md` - Docker-specific documentation:
  - Usage modes (dev/prod)
  - Environment variables guide
  - Architecture diagrams
  - Troubleshooting
  - Deployment checklist

- `.env.example` - Environment variables template

#### Backend Updates
- **CORS Configuration:** Updated to use `CORS_ORIGIN` environment variable
- **Health Endpoints:** Added `/api/health` in addition to `/health`

#### Frontend Updates
- **Environment Config:** Updated `environment.prod.ts` to use dynamic API URL
- **Docker Build:** API URL replacement during build process

### Changed
- CORS now configurable via environment variable instead of accepting all origins (`*`)
- Production API URL now configured at build time via Docker build args

### Security
- Removed wildcard CORS in favor of specific origin configuration
- Added security headers in Nginx (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

---

## [1.0.0] - Initial Release - 2026-02-08

### Added - Core Application

#### Backend
- **Database Schema (5 tables):**
  - `settings` - User names, split percentage, PIN hash
  - `expenses` - Regular and installment expenses
  - `installment_payments` - Individual installment tracking
  - `payments` - Transfer records between users
  - `fixed_expenses` - Budget estimation templates (not real expenses)

- **API Endpoints:**
  - `/api/auth` - PIN setup and verification
  - `/api/settings` - User configuration (names, split %, PIN change)
  - `/api/expenses` - CRUD for expenses with installments support
  - `/api/expenses/:id/installments` - Mark installments as paid/unpaid
  - `/api/payments` - CRUD for transfer records
  - `/api/balance` - Calculate current balance (who owes whom)
  - `/api/fixed-expenses` - CRUD for budget estimation templates

- **Tech Stack:**
  - Node.js + Express + TypeScript
  - Drizzle ORM
  - PostgreSQL (Railway)
  - bcrypt for PIN hashing

#### Frontend
- **7 Main Components:**
  1. **Auth** - PIN setup and login
  2. **Dashboard:**
     - Real balance calculation
     - Monthly estimate (real expenses + fixed expenses + installments)
     - Fixed expenses section (estimations only)
     - Active installments with progress bars
     - Recent expenses list
  3. **Expenses** - List and create expenses (with installments)
  4. **Installments** - Mark individual installments as paid
  5. **Payments** - Register transfers between users
  6. **Fixed Expenses** - Manage estimation templates (no payer, just amount)
  7. **Settings** - Configure names, split %, and change PIN

- **Key Features:**
  - Configurable split percentage (0-100% slider)
  - Installment tracking with monthly breakdown
  - Fixed expenses for budget estimation (not counted in real balance)
  - PIN-based authentication
  - Modal dialogs don't close on backdrop click

- **Tech Stack:**
  - Angular 19 (standalone components, signals)
  - Tailwind CSS
  - TypeScript strict mode

#### Design Decisions
- **Fixed Expenses:** Estimation templates only - shown in "Monthly Estimate" but don't affect real balance
- **Installments:** Monthly amount = total / installments, only paid installments count toward balance
- **Balance Calculation:** `(Person1 share - Person2 share) - (Person1 payments - Person2 payments)`
- **Split Percentage:** Configurable 0-100%, default 50/50
- **Modal Behavior:** Close only via Cancel button, not backdrop click

---

## Version Format

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Categories:
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
