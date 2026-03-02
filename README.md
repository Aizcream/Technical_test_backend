# Wompi E-commerce Backend

This is the backend service for the Wompi technical test e-commerce application, built with **NestJS**, **Prisma**, and following a **Hexagonal Architecture**.

## Architecture & Considerations

- **Hexagonal Architecture (Ports & Adapters):** We separated the domain (`entities`, `repositories`), application use-cases, and infrastructure (`controllers`, `prisma`).
- **Railway Oriented Programming (ROP):** We implemented `Result` / `Either` patterns using the `neverthrow` library in our use-cases to properly model success and error states predictably, avoiding traditional `try/catch` messes.
- **Security:** Integrated OWASP recommended security headers via `helmet` and rate limiting via `@nestjs/throttler`.

## Setup and Running

1. Install dependencies:

   ```bash
   npm install
   ```

2. Setup Environment variables (`.env` file):

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wompi_db"
   PORT=3000
   ```

3. Database (Prisma):

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Run the development server:
   ```bash
   npm run start:dev
   ```

## Testing

Unit test coverage is configured aiming for >80% coverage in core business logic.

```bash
# Run unit tests
npm run test

# Run tests with coverage report
npm run test:cov
```

## API Documentation

Once running, the Swagger API documentation is available at:
`http://localhost:3000/api`
