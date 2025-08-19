# Drag & Drop (Tauri v2 + Vite + TS)

A minimal desktop app demonstrating OS-level drag & drop using Tauri v2. Drop files anywhere in the window to list their absolute paths.

## Getting Started

Prereqs: Node 18+, pnpm (or npm), Rust toolchain.

```bash
pnpm install
pnpm tauri dev
```

Build production bundle:

```bash
pnpm tauri build
```

## Drag & Drop Behavior

- Uses Tauri v2 `onDragDropEvent` from the current webview to receive real file system paths.
- Visual highlight while dragging over; on drop, the app lists the dropped paths in the UI.
- Implemented in `src/main.ts`, UI in `index.html` and styles in `src/styles.css`.

## Configuration

- Window DnD: `src-tauri/tauri.conf.json` → set `dragDropEnabled: true` (default here). Set to `false` if you prefer pure HTML5 DnD without OS paths.
- Capabilities: `src-tauri/capabilities/default.json` currently enables `core:default` and `opener:default`. File size lookups are disabled by default; if needed, enable `fs:default` and add scoped access in Rust.

## Project Structure

- `src/` — Frontend (TypeScript, CSS, assets). Entry is `index.html`.
- `src-tauri/` — Rust backend (`src/lib.rs`, `src/main.rs`, `Cargo.toml`, `tauri.conf.json`, `capabilities/`).
- Root config: `vite.config.ts`, `tsconfig.json`, `package.json`. Design notes in `Rough_Design.md`.

## Scripts

- `pnpm dev` — Vite dev server (frontend only).
- `pnpm tauri dev` — Run the desktop app with live reload.
- `pnpm build` — Type-check and build frontend only.
- `pnpm tauri build` — Create production native bundle.

## IDE Tips

- VS Code with the Tauri extension and rust-analyzer is recommended for best DX.
