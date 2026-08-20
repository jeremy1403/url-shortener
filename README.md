# URL Shortener

A full-stack URL shortener (bit.ly-style) built to learn production AWS cloud engineering — from containerization through to a live, HTTPS-secured deployment with CI/CD.

**Live demo:** https://jeremiah-url-shortener.duckdns.org
*(Hosted on a personal AWS Free Tier account — may be offline if not actively demoed. See "Running it yourself" below.)*

## Features

- User registration and login (JWT-based auth)
- Shorten any long URL into a short, shareable link
- Click tracking per link, with a daily click-history breakdown
- Dashboard showing all your links and their click counts
- Fully containerized with Docker, deployed on AWS

## Tech stack

**Backend:** Node.js, Express, TypeScript, MySQL, JWT
**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
**Infrastructure:** Docker, AWS (EC2, RDS, ECR, IAM, Security Groups), Nginx, Let's Encrypt, GitHub Actions

## Architecture
                 ┌──────────────────────────┐
                 Browser ────────▶ │ Nginx (ports 80/443) │ HTTPS via Let's Encrypt
│ reverse proxy on EC2 │ DNS via free DuckDNS subdomain
└────────────┬──────────────┘
│
┌───────────────────┴───────────────────┐
▼ ▼
┌─────────────────┐ ┌──────────────────┐
│ Next.js (3000) │ │ Express API │
│ frontend │ │ (4000) │
└─────────────────┘ └─────────┬─────────┘
│
▼
┌──────────────────────┐
│ RDS (MySQL) │
│ managed database │
└──────────────────────┘

ECR — stores built Docker images; EC2 pulls from it
IAM — scoped roles/users (EC2→ECR pull role, CI→ECR push-only user)
SG — EC2 open on 80/443/22 only; RDS only reachable from EC2's security group


Both the frontend and backend run as separate Docker containers on a single EC2 instance, behind an Nginx reverse proxy that routes by path: `/api/*` and short-link codes go to the backend, everything else to the frontend. The database is a managed RDS instance rather than a container, so the EC2 instance stays stateless.

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create an account |
| POST | `/api/auth/login` | – | Log in |
| POST | `/api/urls` | ✅ | Shorten a URL |
| GET | `/api/urls` | ✅ | List your URLs with click counts |
| GET | `/api/urls/:id/stats` | ✅ | Click history for one URL |
| GET | `/:shortCode` | – | Redirect to the original URL |

## Running it locally

Requires Docker.

```bash
git clone https://github.com/jeremy1403/url-shortener.git
cd url-shortener
cp .env.example .env   # fill in a DB password and two JWT secrets
docker-compose up --build
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:4000`

This spins up the frontend, backend, and a local MySQL container together — no AWS account needed to try it out.

## Deployment

The production setup (`docker-compose.prod.yml`) is designed to run on a single AWS EC2 instance:

- **RDS** — managed MySQL, not containerized, so instance restarts don't risk data
- **ECR** — private Docker registry; images are built and pushed automatically by GitHub Actions on every push to `main`
- **IAM** — no long-lived credentials on the server: EC2 assumes a read-only ECR role, and CI uses a separate push-only IAM user, not personal credentials
- **Nginx + Let's Encrypt** — free HTTPS via a Certbot-issued certificate, in front of both app containers
- **Elastic IP** — a fixed public IP so the domain and deployed frontend URL don't break across instance stop/starts

CI/CD currently builds and pushes images only; deployment to EC2 is a deliberate manual step (`docker compose pull && up -d`) while the pipeline is still hand-verified.

## What this project was for

Built as a hands-on way to learn core AWS services beyond tutorials — provisioning real infrastructure, wiring up least-privilege IAM instead of defaulting to admin access, debugging real deployment issues (security group conflicts, Docker networking, Nginx routing precedence), and setting up a genuinely free HTTPS + CI/CD pipeline for a personal project.