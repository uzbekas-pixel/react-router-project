import { useEffect, useState } from "react";

const CustomCursor = ({ darkMode }) => {
  
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trailer, setTrailer] = useState({ x: 0, y: 0 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
    
  }, []);

  // Trailer — orqada ergashib keladi
  useEffect(() => {
    let animFrame;
    const follow = () => {
      setTrailer((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.12,
        y: prev.y + (pos.y - prev.y) * 0.12,
      }));
      animFrame = requestAnimationFrame(follow);
    };
    animFrame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animFrame);
  }, [pos]);

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

  useEffect(() => {
    const addHover = () => {
      document.querySelectorAll("a, button, [role=button]").forEach((el) => {
        el.addEventListener("mouseenter", () => setHovering(true));
        el.addEventListener("mouseleave", () => setHovering(false));
        
      });
    };
    addHover();
  }, []);
if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }
  return (
    <>
      {/* Asosiy cursor — kichik dot */}
      <div
        className="fixed top-0 left-0 z-9999 pointer-events-none rounded-full transition-transform duration-75"
        style={{
          width: clicking ? "8px" : "10px",
          height: clicking ? "8px" : "10px",
          background: darkMode ? "#60a5fa" : "#1e40af",
          transform: `translate(${pos.x - 5}px, ${pos.y - 5}px)`,
        }}
      />

      {/* Trailer — orqada ergashuvchi halqa */}
      <div
        className="fixed top-0 left-0 z-9998 pointer-events-none rounded-full border-2 transition-all duration-100"
        style={{
          width: hovering ? "48px" : clicking ? "20px" : "32px",
          height: hovering ? "48px" : clicking ? "20px" : "32px",
          borderColor: darkMode ? "#60a5fa" : "#1e40af",
          opacity: hovering ? 0.6 : 0.4,
          transform: `translate(${trailer.x - (hovering ? 24 : 16)}px, ${trailer.y - (hovering ? 24 : 16)}px)`,
        }}
      />
    </>
  );
};

export default CustomCursor;