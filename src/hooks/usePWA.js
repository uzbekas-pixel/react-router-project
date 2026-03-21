import { useState, useEffect } from "react";

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    console.log("🔍 PWA Hook mounted, listening for beforeinstallprompt...");
    console.log(
      "🖥️ Display mode:",
      window.matchMedia("(display-mode: standalone)").matches
        ? "standalone"
        : "browser",
    );

    const handler = (e) => {
      console.log(
        "✅ beforeinstallprompt event fired! PWA is now installable.",
      );
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Some browsers might fire it very early
    if (window.deferredPrompt) {
      console.log("📦 Found already deferred prompt");
      setTimeout(() => {
        setDeferredPrompt(window.deferredPrompt);
        setIsInstallable(true);
      }, 0);
    }

    return () => {
      console.log("🧹 PWA Hook unmounted");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn("⚠️ No install prompt deferred!");
      return;
    }

    console.log("🚀 Triggering PWA install prompt...");
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, installApp };
};
