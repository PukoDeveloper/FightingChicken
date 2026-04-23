import {
  createEngine,
  EntityManager,
  InputManager,
  TimerManager,
  ParticleManager,
  SceneManager,
  GameStateManager,
} from '@inkshot/engine';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

async function main(): Promise<void> {
  const { core } = await createEngine({
    container: '#app',
    background: 0x000011,
    resizeTo: window,
    antialias: true,
    plugins: [
      new InputManager(),
      new EntityManager(),
      new TimerManager(),
      new ParticleManager(),
      new SceneManager(),
      new GameStateManager(),
      {
        namespace: 'game-bootstrap',
        async init(c) {
          // Fix 1: Use device pixel ratio for crisp rendering on high-DPI screens.
          const dpr = window.devicePixelRatio || 1;
          c.app.renderer.resolution = dpr;
          c.app.renderer.view.autoDensity = true;
          c.app.renderer.resize(c.app.screen.width, c.app.screen.height);

          // Fix 2: The engine Camera offsets the world layer by (W/2, H/2) so that
          // world-space (0,0) maps to the screen centre.  The game uses screen-space
          // coordinates (top-left origin), so cancel the offset by positioning the
          // camera at (W/2, H/2).  This makes world (0,0) → screen (0,0).
          const W = c.app.screen.width;
          const H = c.app.screen.height;
          c.events.emitSync('camera/move', { x: W / 2, y: H / 2 });

          c.events.emitSync('scene/register', { scene: TitleScene });
          c.events.emitSync('scene/register', { scene: GameScene });
          c.events.emitSync('scene/register', { scene: GameOverScene });
          await c.events.emit('scene/load', { key: 'title' });
        },
      },
    ],
  });

  // Prevent context menu on long-press (mobile)
  const canvas = core.app.canvas as HTMLCanvasElement;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

main().catch(console.error);
