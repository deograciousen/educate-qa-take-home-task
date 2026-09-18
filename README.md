# Youth Attendance Automation Task

This project tests `POST /api/v1/attendance` using Playwright with TypeScript.
I have included a small in-memory HTTP server which is started and stopped by the test. This is to ensure that results are deterministic and do not depend on external services.

## How to Install & Run

```bash
npm install
npx playwright install chromium
npm test
```

More useful commands:

```bash
npm run test:headed
npm run test:steps
npm run test:report
npx playwright test tests/attendance.spec.ts --project=chromium
```

## Structure

- `src/pages/attendance-api.page.ts` is the API Page Object Model. It owns endpoint details, request operations, and reusable response assertions.
- `tests/fixtures/mock-attendance-server.ts` provides an isolated mock HTTP service with production-style validation responses.
- `tests/attendance.spec.ts` covers the happy path, required-field validation, invalid status, duplicate IDs, and an empty participants' collection.
