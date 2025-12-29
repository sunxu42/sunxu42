use wasm_bindgen::prelude::*;
use std::cell::RefCell;

thread_local! {
    static RNG_STATE: RefCell<u32> = RefCell::new(12345);
}

fn random() -> f64 {
    RNG_STATE.with(|state| {
        let mut s = state.borrow_mut();
        *s = s.wrapping_mul(1103515245).wrapping_add(12345);
        (*s as f64) / (u32::MAX as f64)
    })
}

#[wasm_bindgen]
pub struct Particle {
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    radius: f64,
    hue: f64,
}

#[wasm_bindgen]
impl Particle {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64, vx: f64, vy: f64, radius: f64, hue: f64) -> Particle {
        Particle {
            x,
            y,
            vx,
            vy,
            radius,
            hue,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f64 {
        self.x
    }

    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f64 {
        self.y
    }

    #[wasm_bindgen(getter)]
    pub fn radius(&self) -> f64 {
        self.radius
    }

    #[wasm_bindgen(getter)]
    pub fn hue(&self) -> f64 {
        self.hue
    }
}

#[wasm_bindgen]
pub struct ParticleSystem {
    particles: Vec<Particle>,
    width: f64,
    height: f64,
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(count: usize, width: f64, height: f64) -> ParticleSystem {
        let mut particles = Vec::with_capacity(count);
        for _ in 0..count {
            let x = random() * width;
            let y = random() * height;
            let vx = (random() - 0.5) * 4.0;
            let vy = (random() - 0.5) * 4.0;
            let radius = 2.0 + random() * 3.0;
            let hue = random() * 360.0;
            particles.push(Particle::new(x, y, vx, vy, radius, hue));
        }
        ParticleSystem {
            particles,
            width,
            height,
        }
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        for p in &mut self.particles {
            p.x += p.vx;
            p.y += p.vy;

            if p.x < 0.0 || p.x > self.width {
                p.vx *= -1.0;
            }
            if p.y < 0.0 || p.y > self.height {
                p.vy *= -1.0;
            }

            p.x = p.x.max(0.0).min(self.width);
            p.y = p.y.max(0.0).min(self.height);
        }
    }

    #[wasm_bindgen]
    pub fn get_particles(&self) -> Vec<Particle> {
        self.particles.clone()
    }

    #[wasm_bindgen]
    pub fn get_particle_count(&self) -> usize {
        self.particles.len()
    }
}
