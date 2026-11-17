# Architecture

## Runtime

The app is a static React/TypeScript single-page application built by Vite. It has no server-side runtime or API.

## Game

`src/game/rules.ts` owns the 52-card deck, shuffle, deal, legal-move checks, turns, draw/pass behavior, wild eights, and discard recycling. `src/game/ai.ts` selects a legal move for one local CPU seat. The UI applies immutable state transitions in React.

## Rendering

`src/components/CardScene.tsx` creates a Three.js scene with one card mesh, generated Canvas textures, ambient and directional light, a capped pixel ratio, resize observation, and explicit disposal on unmount or card change. It reports renderer initialization errors and leaves the 2D controls available.

## Card Studio

`src/App.tsx` contains a fictional text editor whose preview is rendered as HTML/CSS. Edits live only in component state; no request or local persistence is performed.

## Assets and dependencies

The repository has no third-party models, photos, recorded media, or downloaded art. Card faces and backs are generated in the browser. The Space Mono package is listed in `docs/THIRD_PARTY_NOTICES.md`.
