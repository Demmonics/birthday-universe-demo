# Test matrix

Results from the isolated public edition on 2026-11-17.

| Check | Result | Coverage |
| --- | --- | --- |
| `npm ci --no-audit --fund=false` | PASS | Reproducible dependency install from lockfile |
| `npm test` | PASS, 6 tests | Deck/deal, turns, wild eights, win condition, draw/recycle/pass, stalemate, CPU move |
| `npm run build` | PASS with bundle-size warning | TypeScript check and Vite production output |
| `npm run test:e2e` | PASS, 4 tests in Microsoft Edge | WebGL canvas and hand, draw/pass CPU turn, editor with no non-GET requests, 390px overflow |
| Local privacy/file audit | PASS | Allowlisted source and build output only; no secrets, local paths, private media, archives, or source maps found |
| License review | PASS for direct dependencies | Package metadata checked; bundled runtime notices preserved under `docs/licenses/` |

This is not a cross-browser certification or a security audit of a network service; the app has no network service.
