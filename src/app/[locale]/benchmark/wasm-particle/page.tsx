"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export default function WasmParticleBenchmark() {
  const t = useTranslations("common");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState(1000);
  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasmModuleRef = useRef<ParticleWasmModule | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationRef = useRef<number>(null);
  const [canvasWidth] = useState(800);
  const [canvasHeight] = useState(600);

  const loadWasm = async () => {
    try {
      const wasmModule = await import("@/wasm/particle_wasm");
      wasmModuleRef.current = wasmModule;
      setIsLoaded(true);
    } catch (err) {
      setError("Failed to load WASM module. Please build the WASM module first.");
      console.error("WASM load error:", err);
    }
  };

  const initParticleSystem = (count: number) => {
    if (!wasmModuleRef.current) return;
    const system = new wasmModuleRef.current.ParticleSystem(count, canvasWidth, canvasHeight);
    particleSystemRef.current = system;
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    if (!particleSystemRef.current) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const particles = particleSystemRef.current.get_particles();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
      ctx.fill();
    }
  };

  const animate = (timestamp: number) => {
    if (!isRunning) return;

    if (lastFrameTime === 0) {
      setLastFrameTime(timestamp);
    }

    const deltaTime = timestamp - lastFrameTime;
    setFrameCount(prev => prev + 1);

    if (deltaTime >= 1000) {
      const currentFps = Math.round((frameCount * 1000) / deltaTime);
      setFps(currentFps);
      setFrameCount(0);
      setLastFrameTime(timestamp);
    }

    if (particleSystemRef.current) {
      particleSystemRef.current.update();
    }

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
    if (!isLoaded) return;
    setIsRunning(true);
    setLastFrameTime(0);
    setFrameCount(0);
    setFps(0);
    initParticleSystem(particleCount);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawParticles(ctx);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopBenchmark = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {
    loadWasm();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[600px]">
      <h1 className="text-3xl font-bold">{t("wasmVersion")}</h1>

      {!isLoaded && !error && (
        <div className="text-lg text-muted-foreground">Loading WASM module...</div>
      )}

      {error && (
        <div className="text-lg text-red-500 bg-red-50 p-4 rounded">
          {error}
          <div className="mt-2 text-sm">
            To build the WASM module, run:
            <code className="block mt-1 bg-gray-100 p-2 rounded">
              cd wasm/particle-wasm &amp;&amp; wasm-pack build --target web --out-dir
              ../../src/wasm/particle_wasm
            </code>
          </div>
        </div>
      )}

      {isLoaded && (
        <>
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
            className="border border-gray-300 rounded bg-background"
          />
        </>
      )}
    </div>
  );
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  hue: number;
}

interface ParticleSystem {
  update(): void;
  get_particles(): Particle[];
}

interface ParticleWasmModule {
  ParticleSystem: new (count: number, width: number, height: number) => ParticleSystem;
}
