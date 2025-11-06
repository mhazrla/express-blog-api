
# Backend Course - Simple Blog API

> Minimal CRUD API for learning backend development using TypeScript, Express, MongoDB, and JWT.

## Summary

This repository contains a simple backend implementation for a blog application — user registration/login and CRUD operations for blog posts. API documentation is available via Swagger at `/docs`.

Main tech stack:
- Node.js + TypeScript
- Express
- MongoDB (mongoose)
- JWT for authentication
- Swagger (swagger-jsdoc + swagger-ui-express)

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Access to a MongoDB instance (connection URI)

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create an environment file from the example:

```bash
cp .env.example .env
# (On Windows PowerShell)
# copy .env.example .env
```

Fill in the values in `.env` after copying.

## Run

- Development (nodemon + ts-node):

```bash
npm run dev
```

- Build & run (production):

```bash
npm run build
npm start
```

The server listens on `http://localhost:3000` by default. Swagger UI is available at `http://localhost:3000/docs`.

## Testing

This project includes unit tests written with Jest and ts-jest. Tests are located under the `tests/` folder and mock Mongoose models and other external dependencies so they run fast without a real database.

To run the tests:

```bash
npm install
npm test
```

For continuous test development you can run:

```bash
npm run test:watch
```

Test coverage is focused on controller logic (happy paths and error conditions). If you prefer integration-style tests (full HTTP stack + in-memory MongoDB), I can add them — they require additional dev dependencies.

## Environment variables (`.env`)

- `MONGODB_URL` - MongoDB connection string (see `.env.example`).
- `JWT_SECRET` - JWT signing secret.
- `PORT` - optional server port (default 3000).

See `.env.example` for a template without sensitive values.

## Security / Git

DO NOT commit your real `.env` file (containing credentials) to Git or GitHub. This project includes a `.gitignore` entry for `.env`.

Use `.env.example` to share the shape of environment variables without exposing secrets.

## Project structure (short)

```
src/
  index.ts            # entry point
  config/             # config (database, swagger)
  controllers/        # controllers
  middlewares/        # middleware
  models/             # mongoose models
  routes/             # express routers
  utils/              # helper utilities
uploads/              # file uploads (ignored)
```

## Contributing

Please open issues or pull requests. Do not include real credentials in PRs.

## License

MIT — adjust as needed.

