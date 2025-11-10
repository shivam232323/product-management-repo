# Backend API Documentation

Base URL

- Default local base URL: `http://localhost:3000`
- When running locally, set `PORT` in `.env` (default commonly `3000`).

Auth

- POST /api/auth/register
  - Description: Register a new user
  - Body (JSON): { "name": "...", "email": "...", "password": "..." }
  - Response: user object (no password)

- POST /api/auth/login
  - Description: Login and receive JWT
  - Body (JSON): { "email": "...", "password": "..." }
  - Response: { "token": "<jwt>", "user": { ... } }

Categories

- GET /api/categories
  - Description: List categories

- POST /api/categories
  - Description: Create category (protected)
  - Body (JSON): { "name": "..." }

- PUT /api/categories/:id
  - Description: Update category (protected)

- DELETE /api/categories/:id
  - Description: Delete category (protected)

Products

- GET /api/products
  - Description: List products (supports filters/pagination)

- GET /api/products/:id
  - Description: Get product details

- POST /api/products
  - Description: Create product (protected)
  - Body (JSON or multipart/form-data): product fields (name, description, price, categoryId, etc.)

- PUT /api/products/:id
  - Description: Update product (protected)

- DELETE /api/products/:id
  - Description: Delete product (protected)

Bulk upload

- POST /api/bulk/upload
  - Description: Upload CSV/Excel with products (protected)
  - Body: multipart/form-data with file field (e.g., `file`)

Reports

- GET /api/reports/summary  (or `/api/reports` depending on implementation)
  - Description: Generate reports / export data

Authentication

- Protected endpoints require `Authorization: Bearer <token>` header.
- Use the `Login` request in the provided Postman collection to populate the `authToken` environment variable.

Environment Variables

Common variables you may need to set in `.env`:
- PORT=3000
- DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET=your-secret
- QUEUE_URL / other queue configs if queueing is used

Postman

- Import `postman_collection.json` (provided at `backend/postman_collection.json`).
- Create an environment in Postman with a `baseUrl` variable (default `http://localhost:3000`).
- Run `Login` to set the `authToken` variable automatically (collection test script does this).

