import { createRoot } from "react-dom/client";

import { App } from "@ibit/app";

import "./shell.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing from index.html");

createRoot(rootEl).render(
  <div className="shell-frame">
    <App />
  </div>,
);
