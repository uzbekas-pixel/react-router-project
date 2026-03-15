import { useEffect, useRef, useState } from "react";

const Counter = ({ target, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(update);
            else setCount(target);
          };

          requestAnimationFrame(update);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

export default Counter;