# Implementing Drag & Drop (Tauri v2 + Vite + TypeScript)

This guide shows how to add OS-level drag & drop to a Tauri v2 app using the webview drag-drop events. It also includes an HTML5-only fallback (no OS paths).

## Overview
- Tauri mode (recommended): Receive real file system paths via `onDragDropEvent` from the current webview/window.
- HTML5 mode: Disable Tauri interception and handle `DataTransfer.files` in the DOM (no absolute paths by design).

## 1) Dependencies and Scripts
`package.json`
```jsonc
{
  ...
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-opener": "^2",
    "@tauri-apps/plugin-fs": "^2"
  },
  ...
}
```

Initialize with your preferred package manager, e.g. `pnpm install` or `npm install`.

## 2) Tauri Config
`src-tauri/tauri.conf.json`
```jsonc
{
  ...
  "app": {
    "withGlobalTauri": true,
    "windows": [
      {
        ...
        "dragDropEnabled": true
      }
    ],
    "security": { "csp": null }
  }
}
```

## 3) Capabilities (permissions)
If you only list paths, no extra permissions are required. If you later read files, add the FS capability.

`src-tauri/capabilities/default.json`
```jsonc
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default app capability",
  "windows": ["main"],
  "permissions": [
    "core:default"
    // add "fs:default" if you enable the FS plugin and read files
  ]
}
```

## 4) Rust Backend
`src-tauri/Cargo.toml`
```toml
...

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
# Uncomment if you later need opener or fs plugins
# tauri-plugin-opener = "2"
# tauri-plugin-fs = "2"
```

`src-tauri/src/main.rs`
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    drag_and_drop_example_lib::run()
}
```

`src-tauri/src/lib.rs`
```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // .plugin(tauri_plugin_opener::init())
        // .plugin(tauri_plugin_fs::init()) // add if you read files from JS or Rust
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

If you enable `tauri-plugin-fs`, also scope paths in `setup` (e.g., `app.fs_scope().allow_directory("/Users/you", true);`).

## 5) Frontend Markup and Styles
`index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Drag & Drop</title>
    <script type="module" src="/src/main.ts" defer></script>
  </head>
  <body>
    <main class="container">
      <h1>Drag & Drop</h1>
      <p>Drop files anywhere in this window to list their paths.</p>
      <section id="dropzone" class="dropzone">
        <p class="muted">Drag files here (or drop anywhere)</p>
        <ul id="drop-list"></ul>
      </section>
    </main>
  </body>
  </html>
```

## 6) Webview Drag & Drop (Tauri mode)
`src/main.ts`
```ts
import { getCurrentWebview } from "@tauri-apps/api/webview";

async function setupDragAndDrop() {
  const dropzone = document.querySelector<HTMLDivElement>("#dropzone");
  const list = document.querySelector<HTMLUListElement>("#drop-list");
  const webview = await getCurrentWebview();

  await webview.onDragDropEvent(async (event) => {
    const { type, paths } = event.payload as {
      type: "over" | "drop" | "cancel" | "leave";
      paths: string[];
      position: { x: number; y: number };
    };

    if (type === "over") {
      dropzone?.classList.add("drag-over");
      return;
    }
    if (type === "leave" || type === "cancel") {
      dropzone?.classList.remove("drag-over");
      return;
    }
    if (type === "drop") {
      dropzone?.classList.remove("drag-over");
      if (!list) return;
      list.innerHTML = "";
      for (const p of paths) {
        const li = document.createElement("li");
        li.textContent = p; // absolute path from the OS
        list.appendChild(li);
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupDragAndDrop();
});
```

This mode provides absolute paths. Add FS access only if you need to read file contents.

## Notes & Security
- If you read files, use the FS plugin or a Rust command, and scope directories with `fs_scope` to least privilege.
- Avoid permissive CSP in production; configure `app.security.csp` in `tauri.conf.json`.
