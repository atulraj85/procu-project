## 🔓 Stack

- Next14
- Typescript
- Shadcn
- Tailwind

# Database and ORM

- **Generate Migration**: Use command `npx drizzle-kit generate` to generate migration file for the changes.
- **Apply Migrations**: Use command `npx drizzle-kit migrate` to apply migrations.
- **Drizzle Studio (Visual Interface)**: Use command `npx drizzle-kit studio` tp open a visual interface for interacting with your database schema, running queries, and managing migrations. Drizzle Studio provides a user-friendly way to explore and manage your database during development.

## Generate DBML for Database :

```
npx drizzle-dbml-cli src/drizzle/schema.ts -o schema.dbml
```

This will create schema.dbml file in root dir

# Authentication Setup with Prisma, Nodemailer, and bcryptjs using "[https://authjs.dev/](https://authjs.dev/)" framework

In this repository, I tried to configure authentication using NextAuth.js, Prisma, and email functionality with Nodemailer. It includes the setup for email verification and password reset, using UUIDs for tokens and bcryptjs for password hashing.

## Dependencies

Install the required dependencies with the following command:

```bash
npm i next-auth@beta @auth/prisma-adapter nodemailer uuid bcryptjs
```

### Key Dependencies:

- **`next-auth`** & **`@auth/prisma-adapter`**

  - Used to configure the NextAuth framework with Prisma for user authentication.

- **`uuid`**

  - Generates UUIDs for email verification and password reset tokens.

- **`bcryptjs`**

  - Hashes passwords (used instead of `bcrypt` to avoid errors in Auth.js).

- **`nodemailer`**
  - Sends emails for email verification and password resetting.
  - For development, we are using [Ethereal](https://ethereal.email/create) for testing purposes.
  - For QA and production, we will configure environment variables for the SMTP service we use.

## Development Dependencies

Install the development dependencies with the following command:

```bash
npm i -D @types/bcryptjs @types/nodemailer @types/uuid
```

### Dev Dependencies:

- **`@types/bcryptjs`**
- **`@types/nodemailer`**
- **`@types/uuid`**

## Environment Variables

Set the following environment variables for different environments:

- **`AUTH_SECRET`**

  - Used by the NextAuth framework internally.
  - You can generate it using the following command:

    ```bash
    openssl rand -hex 32
    ```

- **`NEXT_PUBLIC_BASE_URL`**

  - The base URL of the environment (e.g., `http://localhost:3000` for development).

- **`NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT`** & **`NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT`**

  - These remain the same for every environment:

    ```bash
    NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT=/auth/verify-email
    NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT=/auth/reset-password
    ```

### Nodemailer Configuration (Development)

- **`NODEMAILER_HOST="smtp.ethereal.email"`**
- **`NODEMAILER_PORT=587`**
- **`NODEMAILER_EMAIL_USER="cletus.sporer58@ethereal.email"`**
- **`NODEMAILER_EMAIL_PASSWORD="j8uStr4HcXtp7YvMd4"`**

For QA and production, these values need to be updated according to the SMTP service used. For example, for Gmail:

- **`NODEMAILER_HOST="smtp.gmail.com"`**
- **`NODEMAILER_PORT=587`** (Use port 587 for TLS or 465 for SSL).

### Token Expiry Times

- **`EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME_MS=3600000`** (1 hour)
- **`PASSWORD_RESET_TOKEN_EXPIRY_TIME_MS=3600000`** (1 hour)

## Notes

- **Hooks for client components**: Use hooks defined in `/src/hooks/auth` to get the current logged-in user or their role.
- **Utility functions for server components**: Use utility functions from `/src/lib/auth.ts` to retrieve user details in server components.
- **Role-based access control**:
  - Get the role in the component and check if the user has access.
  - Alternatively, define protected routes with required roles in the `protectedRoutes` variable in `routes.ts`.
  - A higher-order component, `with-role.tsx`, is available in `/src/components/auth` to manage access control.
