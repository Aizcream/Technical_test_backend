# Wompi E-commerce Backend

This is the backend service for the Wompi technical test e-commerce application, built with **NestJS**, **Prisma**, and following a **Hexagonal Architecture**.

## Architecture & Considerations

- **Hexagonal Architecture (Ports & Adapters):** We separated the domain (`entities`, `repositories`), application use-cases, and infrastructure (`controllers`, `prisma`).
- **Railway Oriented Programming (ROP):** We implemented `Result` / `Either` patterns using the `neverthrow` library in our use-cases to properly model success and error states predictably, avoiding traditional `try/catch` messes.
- **Security (OWASP):** We adhere to OWASP security guidelines by implementing essential defenses:
  - **Security Headers:** Integrated `helmet` to set robust HTTP response headers and prevent common vulnerabilities.
  - **Rate Limiting:** Implemented `@nestjs/throttler` to prevent Brute-Force and DDoS attacks.
  - **Input Validation:** Employed `class-validator` and `class-transformer` at the entry points (controllers) to ensure all incoming data is strictly validated, mitigating Injection attacks.
  - **CORS:** Configured Cross-Origin Resource Sharing to exclusively allow traffic from trusted origins.

## Data Model Design

The core entities and their relationships are structured as follows:

```mermaid
erDiagram
    Client ||--o{ Transaction : creates
    Transaction ||--|{ TransactionItem : contains
    Transaction ||--o| Delivery : tracked_by
    Product ||--o{ TransactionItem : included_in
    Product ||--o{ ProductVariant : has

    Client {
        UUID id PK
        String documentNumber
        String name
        String email UK
    }
    Transaction {
        UUID id PK
        UUID clientId FK
        Int amount
        TransactionStatus status
        String paymentMethod
    }
    TransactionItem {
        UUID id PK
        UUID transactionId FK
        UUID productId FK
        Int quantity
        Int priceUnit
    }
    Delivery {
        UUID id PK
        UUID transactionId FK
        DeliveryStatus status
        String trackingNumber
    }
    Product {
        UUID id PK
        String name
        Int price
        Int stock
    }
    ProductVariant {
        UUID id PK
        UUID productId FK
        String label
        String value
    }
```

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

## Testing & Results

Our test suite is built using **Jest**, comprehensively covering controllers and use cases. Unit test coverage is configured aiming for >80% coverage in core business logic.

```bash
# Run unit tests
npm run test

# Run tests with coverage report
npm run test:cov
```

**Test Coverage Results:**
As seen in our test executions, all core business logic (Use Cases and Controllers) maintain excellent coverage (above 90%), guaranteeing software reliability.

![Jest Coverage Results](./test-coverage.png)
_(Note: Placed the test coverage screenshot you have as `test-coverage.png` at the root of `wompi-backend` to display it here)._

## API Documentation

Once running, the Swagger API documentation is available at:
`https://contractors-changelog-subtle-consumer.trycloudflare.com/api`
