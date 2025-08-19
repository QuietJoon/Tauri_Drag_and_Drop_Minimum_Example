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
        li.textContent = p;
        list.appendChild(li);
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupDragAndDrop();
});
