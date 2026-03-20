import { useState, useEffect } from "react";

/**
 * Hook — faqat birinchi kirganda onboarding ko'rsatish uchun
 */
export const useOnboarding = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("onboarding_done");
    let timer;
    if (!done) {
      timer = setTimeout(() => setShow(true), 1000);
    }
    return () => clearTimeout(timer);
  }, []);

  return { show, hide: () => setShow(false) };
};
