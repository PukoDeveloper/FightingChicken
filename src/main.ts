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
