# FuelSync Hub

A multi-tenant fuel station SaaS platform, where each Owner has their own Stations, and each station has Pumps and Nozzles that are used for recording fuel sales manually.

## Features

- Multi-tenant architecture with PostgreSQL schema isolation
- Plan-based system (basic, premium, enterprise)
- Role-based access control (superadmin, owner, manager, employee)
- Station management with pumps and nozzles
- Manual sales recording
- End-of-day reconciliation
- Credit tracking
- Reporting and analytics

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, Next.js, Material UI
- **Authentication**: JWT tokens
- **Deployment**: Azure (planned)

## Project Structure

The project is divided into two main directories:

- `backend/`: Express.js API server
- `frontend/`: Next.js frontend application

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- Azure PostgreSQL database (for production)

### Environment Setup

Create a `.env` file in the backend directory with the following variables:
