import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.jsx";

registerSW({ immediate: true });
import { LangProvider } from "./context/LangProvider.jsx";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SoundProvider } from "./context/SoundContext.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

// Global capture for PWA install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("🌍 Global: beforeinstallprompt caught");
  window.deferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LangProvider>
          <AuthProvider>
            <SoundProvider>
              <App />
            </SoundProvider>
          </AuthProvider>
        </LangProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
