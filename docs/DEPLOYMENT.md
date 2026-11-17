# Deployment

This edition is a static browser application. No server, environment variables, database, account credentials, or API keys are required.

1. Use Node.js 22 or newer and run `npm ci`.
2. Run `npm test` and `npm run build`.
3. Publish the contents of `dist/` to a static web host that serves `index.html` for the application route.
4. Confirm the host serves the hashed JavaScript, CSS, font files, and `/demo-preview.png` from the same origin.

No deployment provider or production URL has been configured or verified.
