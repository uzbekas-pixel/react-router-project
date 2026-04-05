import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 z-100000 pointer-events-none rounded-full backdrop-blur-md transition-transform duration-75"
      style={{
        width: clicking ? "10px" : "14px",
        height: clicking ? "10px" : "14px",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        transform: `translate(${pos.x - 7}px, ${pos.y - 7}px)`,
      }}
    />
  );
};

export default CustomCursor;