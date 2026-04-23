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
import { GAME_W, GAME_H } from './constants';

async function main(): Promise<void> {
  const { core } = await createEngine({
    container: '#app',
    background: 0x000011,
    width: GAME_W,
    height: GAME_H,
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
          // Use device pixel ratio for crisp rendering on high-DPI screens.
          const dpr = window.devicePixelRatio || 1;
          c.app.renderer.resolution = dpr;

          // Scale the canvas via CSS so it always fits within the viewport while
          // maintaining the fixed GAME_W × GAME_H aspect ratio.  This replaces the
          // old resizeTo: window approach and works reliably on all mobile browsers.
          const canvas = c.app.canvas as HTMLCanvasElement;
          function scaleCanvas(): void {
            const scaleX = window.innerWidth / GAME_W;
            const scaleY = window.innerHeight / GAME_H;
            const scale = Math.min(scaleX, scaleY);
            canvas.style.width  = `${GAME_W * scale}px`;
            canvas.style.height = `${GAME_H * scale}px`;
          }
          scaleCanvas();
          window.addEventListener('resize', scaleCanvas);

          // Clean up the resize listener when the engine is destroyed.
          c.events.on('game-bootstrap', 'core/destroy', () => {
            window.removeEventListener('resize', scaleCanvas);
          });

          // The engine Camera offsets the world layer by (W/2, H/2) so that
          // world-space (0,0) maps to the screen centre.  The game uses screen-space
          // coordinates (top-left origin), so cancel the offset by positioning the
          // camera at (W/2, H/2).  This makes world (0,0) → screen (0,0).
          c.events.emitSync('camera/move', { x: GAME_W / 2, y: GAME_H / 2 });

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
