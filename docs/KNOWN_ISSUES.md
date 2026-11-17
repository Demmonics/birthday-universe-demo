# Known issues and limits

- The initial JavaScript bundle is 762.74 kB minified (203.87 kB gzip). Vite warns above its 500 kB threshold; the current bundle includes React and Three.js.
- Browser verification was performed in Microsoft Edge with software WebGL. Other browsers and devices have not been independently certified.
- The CPU uses a basic legal-move heuristic and does not model strategy.
- Word search, jigsaw, network multiplayer, printing, export, persistence, accounts, and backend services are not part of this edition.

No blocking game or rendering defect was observed in the listed local test run.
