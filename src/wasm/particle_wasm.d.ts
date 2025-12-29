export interface Particle {
  x: number;
  y: number;
  radius: number;
  hue: number;
}

export interface ParticleSystem {
  update(): void;
  get_particles(): Particle[];
  get_particle_count(): number;
}

export const ParticleSystem: new (count: number, width: number, height: number) => ParticleSystem;
