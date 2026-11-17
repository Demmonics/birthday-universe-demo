# Feature status

Statuses reflect this public edition and are changed only with implementation and test evidence.

| Feature | Status | Source | Test evidence | Limitation |
| --- | --- | --- | --- | --- |
| Crazy Eights rules | TESTED | `src/game/rules.ts` | `src/game/rules.test.ts` | Two seats; no online service |
| CPU opponent | TESTED | `src/game/ai.ts` | `src/game/rules.test.ts` | Basic legal-move heuristic |
| Three.js card preview | TESTED | `src/components/CardScene.tsx` | `tests/app.spec.ts` in Edge | Requires WebGL |
| Card Studio text preview | TESTED | `src/App.tsx` | `tests/app.spec.ts` in Edge | In-memory only |
| Word-search engine | PLANNED | Not included | None | Requires separate source review |
| Jigsaw engine | PLANNED | Not included | None | Requires separate source review |
| Multiplayer, printing, and export | PLANNED | Not included | None | No implementation in this edition |

The listed tests passed in the local sanitized checkout on 2026-11-17. Do not retain `TESTED` if a later change makes the named tests fail.
