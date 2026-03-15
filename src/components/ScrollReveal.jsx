import { useEffect, useRef, useState } from "react";

const ScrollReveal = ({ children, direction = "up", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const directions = {
    up:    "translate-y-10 opacity-0",
    down:  "-translate-y-10 opacity-0",
    left:  "translate-x-10 opacity-0",
    right: "-translate-x-10 opacity-0",
  };

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? "translate(0,0)" : undefined,
        opacity: visible ? 1 : undefined,
      }}
    >
      <div className={visible ? "" : directions[direction]}>
        {children}
      </div>
    </div>
  );
};

export default ScrollReveal;