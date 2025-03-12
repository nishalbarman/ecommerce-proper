# Jharna Mehendi

Welcome to the Jharna Mehendi codebase. This repository contains multiple applications and packages designed to work together to deliver a full-stack solution. The projects include an admin dashboard, a client-facing web application, server-side components, and several utility packages.

> **Note:** This project is proprietary. No one is allowed to use, distribute, or modify the code without explicit permission from the owner.

---

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License & Usage Restrictions](#license--usage-restrictions)

---

## Overview

This repository is organized as a monorepo. The codebase comprises several parts:

- **apps/admin**: Contains the admin dashboard built with React and Vite.
- **apps/client**: The client-side application built with Next.js.
- **apps/hooks** and **apps/server**: Provide additional functionalities and backend services.
- **packages**: Reusable libraries such as `custom-click`, `firebase-utils`, `redux`, and `validator`.

---

## Monorepo Structure

```plaintext
.
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .npmrc
├── netlify.toml
├── package.json
├── README.md
├── turbo.json
├── .turbo/
├── .vercel/
│   └── project.json
├── apps/
│   ├── admin/
│   │   ├── .env
│   │   └── ...other admin files...
│   ├── client/
│   │   └── ...client files...
│   ├── hooks/
│   └── server/
└── packages/
    ├── custom-click/
    ├── firebase-utils/
    ├── redux/
    └── validator/
```

---

## Getting Started

1. **Clone the Repository**

   ```sh
   git clone https://github.com/yourusername/project-name.git
   cd project-name
   ```

2. **Install Dependencies**

   Use your preferred package manager (npm, yarn, or pnpm):

   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**

   - Copy the `.env.example` file to a new `.env` file at the root.
   - For the admin app, ensure that [apps/admin/.env](apps/admin/.env) is properly configured.
   - Similarly, configure other environment files for different apps as needed.

---

## Development

### Running the Apps

- **Admin App**  
  Navigate to the `apps/admin` directory and run the development server (typically using Vite):

  ```sh
  cd apps/admin
  npm run dev
  ```

- **Client App**  
  Navigate to the `apps/client` directory and start the Next.js development server:

  ```sh
  cd apps/client
  npm run dev
  ```

Turborepo can help manage running multiple apps concurrently. Refer to [turbo.json](turbo.json) for configuration details.

---

## Scripts

The root [`package.json`](package.json) includes various scripts to help with building, testing, and managing the monorepo:

- `npm run dev` – Run all development servers.
- `npm run build` – Build all apps and packages.
- `npm run test` – Run unit and integration tests.

Consult the `package.json` for a full list of available scripts.

---

## Testing

Tests can be found in the `test` directory. To run tests, execute:

```sh
npm run test
```

Ensure that each project/app includes its own test suite where applicable.

---

## Deployment

Deployment is configured through [Netlify](netlify.toml) and [Vercel](.vercel/project.json). Before deployment, make sure you have properly set up your environment variables.

- **Netlify**: Follow the instructions in [netlify.toml](netlify.toml) for deployment settings.
- **Vercel**: Use the Vercel CLI or dashboard with the configuration provided in the `.vercel` directory.

---

## Contributing

Contributions are not open to the public. If you have been granted permission to contribute, please adhere to the following guidelines:

- Fork the repository.
- Create a new branch for your feature or bug fix.
- Submit a pull request describing your changes.
- Ensure that all tests pass and follow the existing code style.

If you do not have permission, please contact the project maintainers for access.

---

## License & Usage Restrictions

This codebase is proprietary and confidential. All rights are reserved. Unauthorized use, distribution, reproduction, or modification of the code is strictly prohibited. For licensing inquiries or permissions, please contact the project owner.

---

Happy Coding!