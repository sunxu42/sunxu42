"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function JSParticleBenchmark() {
  const t = useTranslations("common");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState(1000);
  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(null);
  const [canvasWidth] = useState(800);
  const [canvasHeight] = useState(600);

  const initParticles = (count: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 2 + Math.random() * 3,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }
    particlesRef.current = particles;
    console.log(`Initialized ${particles.length} particles`);
  };

  const updateParticles = () => {
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
      if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

      p.x = Math.max(0, Math.min(canvasWidth, p.x));
      p.y = Math.max(0, Math.min(canvasHeight, p.y));
    }

    if (particles.length > 0 && frameCountRef.current % 60 === 0) {
      const p = particles[0];
      console.log(
        `Frame ${frameCountRef.current}: First particle pos (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) vel (${p.vx.toFixed(2)}, ${p.vy.toFixed(2)})`
      );
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    console.log(`Drawing ${particles.length} particles`);
    console.log(`Canvas context:`, ctx);
    console.log(`Canvas size: ${canvasWidth}x${canvasHeight}`);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    if (particles.length > 0) {
      const p = particles[0];
      console.log(`First particle: x=${p.x}, y=${p.y}, radius=${p.radius}, color=${p.color}`);
    }
  };

  const animate = (timestamp: number) => {
    console.log(`animate called, isRunning: ${isRunningRef.current}, timestamp: ${timestamp}`);

    if (!isRunningRef.current) return;

    if (lastFrameTimeRef.current === 0) {
      lastFrameTimeRef.current = timestamp;
      console.log(`First frame, set lastFrameTime to ${timestamp}`);
    }

    const deltaTime = timestamp - lastFrameTimeRef.current;
    frameCountRef.current += 1;

    console.log(`Frame ${frameCountRef.current}, deltaTime: ${deltaTime}ms`);

    if (deltaTime >= 1000) {
      const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
      setFps(currentFps);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = timestamp;
      console.log(
        `FPS: ${currentFps}, deltaTime: ${deltaTime}ms, frames: ${frameCountRef.current}`
      );
    }

    updateParticles();

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawParticles(ctx);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const startBenchmark = () => {
    setIsRunning(true);
    isRunningRef.current = true;
    lastFrameTimeRef.current = 0;
    frameCountRef.current = 0;
    setFps(0);
    initParticles(particleCount);

    const canvas = canvasRef.current;
    if (canvas) {
      console.log(`Canvas element:`, canvas);
      console.log(`Canvas width attribute: ${canvas.width}, height attribute: ${canvas.height}`);
      console.log(`Canvas CSS width: ${canvas.style.width}, CSS height: ${canvas.style.height}`);
      console.log(
        `Canvas offsetWidth: ${canvas.offsetWidth}, offsetHeight: ${canvas.offsetHeight}`
      );

      const ctx = canvas.getContext("2d");
      if (ctx) {
        console.log(`Canvas context:`, ctx);

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(400, 300, 50, 0, Math.PI * 2);
        ctx.fill();
        console.log("Drew a red test circle at (400, 300) with radius 50");

        setTimeout(() => {
          drawParticles(ctx);
        }, 1000);
      } else {
        console.error(`Failed to get 2d context`);
      }
    } else {
      console.error(`Canvas ref is null`);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopBenchmark = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[600px]">
      <h1 className="text-3xl font-bold">{t("jsVersion")}</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="particleCount" className="font-semibold">
            {t("particleCount")}:
          </label>
          <input
            id="particleCount"
            type="number"
            min="100"
            max="10000"
            step="100"
            value={particleCount}
            onChange={e => setParticleCount(Number(e.target.value))}
            disabled={isRunning}
            className="border border-gray-300 rounded px-3 py-2 w-32 disabled:bg-gray-100"
          />
        </div>

        <button
          onClick={startBenchmark}
          disabled={isRunning}
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded font-semibold"
        >
          {t("start")}
        </button>

        <button
          onClick={stopBenchmark}
          disabled={!isRunning}
          className="cursor-pointer bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-2 rounded font-semibold"
        >
          {t("stop")}
        </button>
      </div>

      <div className="text-xl font-semibold">
        {t("fps")}: <span className="text-blue-600">{fps}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-2 border-gray-500 rounded bg-black"
      />
    </div>
  );
}
