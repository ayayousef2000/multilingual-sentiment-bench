import "@/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./workers/App";

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element #root not found. Check your index.html.");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
