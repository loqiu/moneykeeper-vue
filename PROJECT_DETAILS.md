# MoneyKeeper Frontend Project Details

## Project Purpose

This repository is the Vue frontend for the MoneyKeeper project.

When making frontend changes that involve API requests, response parsing, field mapping, error handling, authentication, payment flow, or SSE behavior, the backend API contract must be checked first.

## Backend API Document

Source of truth for backend API behavior:

- Backend repository: `C:\WorkSpace\Java\moneykeeper-back`
- API document: `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`

## Working Rule

Before optimizing or modifying frontend code related to backend integration, do this first:

1. Open `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`
2. Check whether request paths, request parameters, response structure, business `code`, error messages, auth rules, or field names have changed
3. Then update the frontend API handling and data mapping as needed

## Frontend Change Guidance

When backend API changes are found, prefer updating these layers first:

- request client / interceptors
- API module wrappers
- response parsing
- field mappers

Do not spread backend field-shape changes directly across page components unless necessary.

## Notes

- The backend document is maintained in the backend project and may be updated independently of this frontend repository.
- This file exists to remind contributors to verify the backend API contract before frontend implementation work.
