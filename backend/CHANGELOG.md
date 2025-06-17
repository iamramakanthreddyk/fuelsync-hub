# Changelog

All notable changes to the FuelSync Hub backend will be documented in this file.

## Unreleased → v0.3.0

### Authentication System Refactor

- **Consolidated Auth Strategy**: Standardized on JWT for both tenant and admin authentication
- **Improved Error Handling**: Added structured error responses with consistent format
- **Type Safety**: Added proper TypeScript declarations for JWT payloads and Express extensions
- **Security Hardening**: 
  - Improved JWT validation with audience and issuer checks
  - Added role-based access control middleware
  - Secured environment variable handling
- **Code Organization**: 
  - Separated auth logic into dedicated service layer
  - Improved middleware structure and reusability
- **Testing**: Added unit tests for auth service

### Environment Configuration

- Added proper environment variable handling with secure defaults
- Created `.env.example` file to document required variables
- Added warnings when sensitive variables are missing in production

### API Documentation

- Updated Swagger definitions for auth endpoints
- Standardized response formats across all endpoints