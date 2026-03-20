import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  velocityX: number;
  velocityY: number;
  hue: number;
};

export default function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let frameId = 0;
    let pointerActive = false;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const spawn = (x: number, y: number) => {
      for (let i = 0; i < 8; i += 1) {
        particles.push({
          x,
          y,
          radius: 2 + Math.random() * 8,
          alpha: 0.24 + Math.random() * 0.24,
          velocityX: (Math.random() - 0.5) * 2.2,
          velocityY: (Math.random() - 0.5) * 2.2,
          hue: 190 + Math.random() * 60,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.radius *= 0.985;
        particle.alpha *= 0.965;

        if (particle.alpha < 0.01 || particle.radius < 0.6) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 95%, 78%, ${particle.alpha})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 95%, 62%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const handleMove = (event: PointerEvent) => {
      if (!pointerActive) return;
      spawn(event.clientX, event.clientY);
    };

    const handleDown = (event: PointerEvent) => {
      pointerActive = true;
      spawn(event.clientX, event.clientY);
    };

    const handleUp = () => {
      pointerActive = false;
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="splash-cursor" aria-hidden="true" />;
}
