import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

const clickParticleOptions = {
  color: { value: ['#176B5A', '#E36B4F', '#D99A27'] },
  life: { count: 1, duration: { value: 14 } },
  links: { enable: true, distance: 130, opacity: 0.4 },
  move: { enable: true, outModes: { default: 'destroy' }, random: false, speed: { min: 2.2, max: 3.6 }, straight: true },
  opacity: { animation: { enable: true, speed: 0.2, startValue: 'max', sync: false }, value: { min: 0.15, max: 0.9 } },
  shape: { options: { polygon: { sides: 6 } }, type: 'polygon' },
  size: { value: { min: 5, max: 12 } },
};

const ambientParticleOptions = {
  color: { value: ['#176B5A', '#E36B4F', '#D99A27'] },
  life: { count: 1, duration: { value: 28 } },
  links: { enable: true, distance: 170, opacity: 0.65 },
  move: { direction: 'none', enable: true, outModes: { default: 'destroy' }, random: true, speed: { min: 0.16, max: 0.38 } },
  opacity: { animation: { enable: true, speed: 0.07, startValue: 'random', sync: false }, value: { min: 0.58, max: 0.95 } },
  shape: { options: { polygon: { sides: 6 } }, type: ['triangle', 'polygon'] },
  size: { value: { min: 3, max: 8 } },
};

const ambientParticleLimit = 30;
const ambientSpawnIntervalMs = 1100;
const ambientLifetimeMs = 28000;

const initializeBackground = async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  await loadSlim(tsParticles);
  const container = await tsParticles.load({
    id: 'tsparticles',
    options: {
      background: { color: 'transparent' },
      detectRetina: true,
      fpsLimit: 45,
      fullScreen: { enable: false },
      particles: {
        color: { value: ['#176B5A', '#E36B4F', '#D99A27'] },
        links: { color: '#D99A27', distance: 150, enable: true, opacity: 0.38, width: 1 },
        move: { direction: 'none', enable: true, outModes: { default: 'out' }, random: true, speed: { min: 0.18, max: 0.48 } },
        number: { density: { enable: true, area: 900 }, value: 42 },
        opacity: { value: { min: 0.2, max: 0.6 } },
        shape: { options: { polygon: { sides: 6 } }, type: ['circle', 'triangle', 'polygon'] },
        size: { value: { min: 1.5, max: 4.5 } },
      },
      pauseOnBlur: true,
    },
  });

  let ambientParticleCount = 0;
  const spawnAmbientShape = () => {
    if (document.hidden || ambientParticleCount >= ambientParticleLimit) {
      return;
    }

    const canvasSize = container.canvas.size;
    if (!canvasSize.width || !canvasSize.height) {
      return;
    }

    const particle = container.particles.addParticle(
      {
        x: Math.random() * canvasSize.width,
        y: Math.random() * canvasSize.height,
      },
      ambientParticleOptions,
    );
    if (!particle) {
      return;
    }

    ambientParticleCount += 1;
    window.setTimeout(() => {
      ambientParticleCount = Math.max(0, ambientParticleCount - 1);
    }, ambientLifetimeMs);
  };

  spawnAmbientShape();
  window.setInterval(spawnAmbientShape, ambientSpawnIntervalMs);

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) {
      return;
    }

    const canvasBounds = container.canvas.domElement?.getBoundingClientRect();
    if (!canvasBounds) {
      return;
    }

    const burstCount = 8;
    const pixelRatio = container.retina.pixelRatio;
    const burstRadius = 18 * pixelRatio;
    const originX = (event.clientX - canvasBounds.left) * pixelRatio;
    const originY = (event.clientY - canvasBounds.top) * pixelRatio;

    for (let index = 0; index < burstCount; index += 1) {
      const angle = (Math.PI * 2 * index) / burstCount;
      const angleDegrees = (angle * 180) / Math.PI;
      container.particles.addParticle(
        {
          x: originX + Math.cos(angle) * burstRadius,
          y: originY + Math.sin(angle) * burstRadius,
        },
        {
          ...clickParticleOptions,
          move: { ...clickParticleOptions.move, direction: angleDegrees },
        },
      );
    }
  }, { passive: true });
};

initializeBackground().catch((error) => {
  console.error('tsParticles 背景初始化失败。', error);
});
