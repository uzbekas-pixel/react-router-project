import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.jsx";

registerSW({ immediate: true });
import { LangProvider } from "./context/LangProvider.jsx";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

// Global capture for PWA install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("🌍 Global: beforeinstallprompt caught");
  window.deferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
