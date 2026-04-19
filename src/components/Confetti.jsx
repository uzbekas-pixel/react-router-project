import { useEffect, useRef } from "react";

const Confetti = ({ onDone }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      speed: Math.random() * 4 + 2,
      rotSpeed: (Math.random() - 0.5) * 4,
    }));

    let frame;
    let done = false;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allGone = true;

      pieces.forEach((p) => {
        p.y += p.speed;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height) allGone = false;

        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (allGone && !done) {
        done = true;
        onDone();
      } else {
        frame = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-9998 pointer-events-none"
    />
  );
};

export default Confetti;
