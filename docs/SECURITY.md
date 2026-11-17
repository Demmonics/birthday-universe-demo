# Security and privacy

This showcase intentionally has no account, authentication, session, server, API, upload, analytics, or multiplayer boundary. Game actions and card text are held in React memory and are discarded when the page reloads.

The editor does not submit its form. It accepts plain text with length limits and renders it as React text, not HTML. No private photographs, messages, puzzle solutions, local files, environment values, screenshots, or secrets are part of the project. The build is static and contains only the reviewed allowlist in this repository.

Do not add private data or broaden the data flow without review. Run local scans before every public push; do not upload source or artifacts to third-party scanners.
