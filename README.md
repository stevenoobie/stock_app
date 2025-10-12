# Stock App — Inventory & Sales Management System

A full-stack inventory management platform built with NestJS, React, and PostgreSQL, designed to help manage products, sales, and expenses efficiently.
The project demonstrates solid backend–frontend integration, containerization with Docker, and automated CI/CD pipelines using GitHub Actions and Azure Web Apps.

## Tech Stack:

1. Frontend: React (Vite), Shadcn UI, TypeScript & Tailwind CSS.
2. Backend: NestJS (Node.js), PostgreSQL & Prisma ORM.
3. DevOps & Deployment: Docker, Docker Compose, GitHub Actions (CI/CD), Azure Web Apps.

## Features:

1. Manage stock, sales, and expenses
2. Dashboard for business insights and tracking
3. Secure authentication with JWT
4. Automated deployment through GitHub Actions
5. Containerized and cloud-ready setup

## Environment Variables: 

  ### Frontend (.env in /frontend): 
    VITE_API_BASE_URL=<your_backend_api_url>
  ### Backend (.env in /backend):
    DATABASE_URL=<your_postgres_connection_string>
    JWT_SECRET=<your_jwt_secret>

## Local Development Setup:

  ### Requirements:

    -Docker & Docker Compose installed
    -Node.js 18+ (if you prefer to run locally without Docker)

  ### To start the full stack:
    docker-compose up --build

This will start:

### Backend (NestJS), Frontend (React) & PostgreSQL (local container unless using an external DB)

## Once running:

1. Frontend: http://localhost:8000 [set in frontend env]

2. Backend: http://localhost:3000

## CI/CD Pipeline

The project uses two GitHub Actions workflows.

### ci.yml 
Runs automatically on every push or pull request to:

 1. Install dependencies
 2. Run backend tests
 3. Build the frontend

### deploy.yml 
Triggers on push to the production branch and:
  1. Builds Docker images for frontend and backend
  2. Pushes them to GitHub Container Registry
  3. Deploys both apps to Azure Web Apps

**All secrets are managed securely in GitHub Secrets.

## Deployment
  1. The app is deployed on Azure Web Apps, with separate instances for the frontend and backend.
  2. Each push to the production branch triggers a new container build and deployment automatically.
  3. Environment variables are configured directly in Azure App Service settings.

## Highlights
  1. Full-stack implementation with modern frameworks.
  2. Complete DevOps lifecycle: build, test, and deploy.
  3. Practical CI/CD setup using GitHub Actions.
  4. Cloud-native and containerized architecture.








