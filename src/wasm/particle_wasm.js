export const ParticleSystem = class {
  constructor(count, width, height) {
    throw new Error(
      "WASM module not built. Please run: cd wasm/particle-wasm && wasm-pack build --target web --out-dir ../../src/wasm/particle_wasm"
    );
  }

  update() {
    throw new Error("WASM module not built");
  }

  get_particles() {
    throw new Error("WASM module not built");
  }

  get_particle_count() {
    throw new Error("WASM module not built");
  }
};
