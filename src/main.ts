import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  createEngine,
  EntityManager,
  InputManager,
  TimerManager,
  ParticleManager,
  SceneManager,
  GameStateManager,
  TweenManager,
  SaveManager,
  LocalStorageSaveAdapter,
  AchievementPlugin,
  DebugPlugin,
} from '@inkshot/engine';
import { TitleScene } from './scenes/TitleScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { DevMenuScene } from './scenes/DevMenuScene';
import { EndlessBuffScene } from './scenes/EndlessBuffScene';
import { CostumeSelectScene } from './scenes/CostumeSelectScene';
import { AchievementsScene } from './scenes/AchievementsScene';
import { SkillSelectScene } from './scenes/SkillSelectScene';
import { StoryScene } from './scenes/StoryScene';
import { StoryPrologueScene } from './scenes/StoryPrologueScene';
import { StoryChapter1Scene } from './scenes/StoryChapter1Scene';
import { StoryChapter1EndScene } from './scenes/StoryChapter1EndScene';
import { StoryChapter2Scene } from './scenes/StoryChapter2Scene';
import { StoryChapter2EndScene } from './scenes/StoryChapter2EndScene';
import { StoryChapter3Scene } from './scenes/StoryChapter3Scene';
import { StoryChapter3EndScene } from './scenes/StoryChapter3EndScene';
import { StoryChapter4Scene } from './scenes/StoryChapter4Scene';
import { StoryChapter4EndScene } from './scenes/StoryChapter4EndScene';
import { StoryChapter5Scene } from './scenes/StoryChapter5Scene';
import { StoryChapter5EndScene } from './scenes/StoryChapter5EndScene';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { EncyclopediaScene } from './scenes/EncyclopediaScene';
import { EquipmentScene } from './scenes/EquipmentScene';
import { GAME_W, GAME_H } from './constants';
import { initPersistence, loadProgress } from './game/persistence';
import { initAchievements } from './game/achievements';
import { TEXT } from './game/i18n';

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
      new TweenManager(),
      new SaveManager(),
      new LocalStorageSaveAdapter({ keyPrefix: 'fightingchicken:' }),
      new AchievementPlugin(),
      // Debug overlay (Backtick / F12 to toggle) — only bundled in dev mode.
      ...(import.meta.env.DEV ? [new DebugPlugin()] : []),
      {
        namespace: 'game-bootstrap',
        async init(c) {
          // ── Persist & load ──────────────────────────────────────────────────
          initPersistence(c);
          await loadProgress();

          // ── Achievements ────────────────────────────────────────────────────
          initAchievements(c);

          // ── Achievement notification overlay ────────────────────────────────
          // Lives on the persistent system layer so it appears on top of every
          // scene without being cleaned up on scene transitions.
          const { output: sysOut } = c.events.emitSync('renderer/layer', { name: 'system' });
          const sysLayer = sysOut.layer as Container;

          const ACH_W = 290;
          const ACH_H = 64;
          const achContainer = new Container();
          achContainer.alpha = 0;
          achContainer.x = (GAME_W - ACH_W) / 2;
          achContainer.y = 72;
          sysLayer.addChild(achContainer);

          const achBg = new Graphics();
          achBg
            .roundRect(0, 0, ACH_W, ACH_H, 12)
            .fill({ color: 0x0d2d1a, alpha: 0.94 });
          achBg
            .roundRect(0, 0, ACH_W, ACH_H, 12)
            .stroke({ color: 0x44ff88, width: 2 });
          achContainer.addChild(achBg);

          const achTitleText = new Text({
            text: TEXT.achievements.unlockedToastTitle,
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 13,
              fill: 0x44ff88,
              fontWeight: 'bold',
            }),
          });
          achTitleText.x = 12;
          achTitleText.y = 8;
          achContainer.addChild(achTitleText);

          const achNameText = new Text({
            text: '',
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 18,
              fill: 0xeeffee,
              fontWeight: 'bold',
            }),
          });
          achNameText.x = 12;
          achNameText.y = 27;
          achContainer.addChild(achNameText);

          let achHideTimer = 0;

          c.events.on(
            'game-bootstrap',
            'achievement/unlocked',
            ({ name }: { name: string }) => {
              achNameText.text = name;
              // Fade in
              c.events.emitSync('tween/kill', { target: achContainer as unknown as Record<string, unknown> });
              c.events.emitSync('tween/to', {
                target: achContainer as unknown as Record<string, unknown>,
                props: { alpha: 1 },
                duration: 300,
                ease: 'easeOutQuad',
              });
              // Auto-hide after 3.2 s
              clearTimeout(achHideTimer);
              achHideTimer = window.setTimeout(() => {
                c.events.emitSync('tween/to', {
                  target: achContainer as unknown as Record<string, unknown>,
                  props: { alpha: 0 },
                  duration: 500,
                  ease: 'easeInQuad',
                });
              }, 3200);
            },
          );

          // ── Persistence error notification overlay ──────────────────────────
          const SAVE_W = 310;
          const SAVE_H = 70;
          const saveContainer = new Container();
          saveContainer.alpha = 0;
          saveContainer.x = (GAME_W - SAVE_W) / 2;
          saveContainer.y = 144;
          sysLayer.addChild(saveContainer);

          const saveBg = new Graphics();
          saveBg
            .roundRect(0, 0, SAVE_W, SAVE_H, 12)
            .fill({ color: 0x331111, alpha: 0.95 });
          saveBg
            .roundRect(0, 0, SAVE_W, SAVE_H, 12)
            .stroke({ color: 0xff6666, width: 2 });
          saveContainer.addChild(saveBg);

          const saveTitleText = new Text({
            text: TEXT.persistence.errorToastTitle,
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 14,
              fill: 0xffaaaa,
              fontWeight: 'bold',
            }),
          });
          saveTitleText.x = 12;
          saveTitleText.y = 8;
          saveContainer.addChild(saveTitleText);

          const saveBodyText = new Text({
            text: TEXT.persistence.errorToastBody,
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 12,
              fill: 0xffdddd,
              wordWrap: true,
              wordWrapWidth: SAVE_W - 24,
            }),
          });
          saveBodyText.x = 12;
          saveBodyText.y = 30;
          saveContainer.addChild(saveBodyText);

          let saveHideTimer = 0;
          c.events.on(
            'game-bootstrap',
            'persistence/error',
            () => {
              c.events.emitSync('tween/kill', { target: saveContainer as unknown as Record<string, unknown> });
              c.events.emitSync('tween/to', {
                target: saveContainer as unknown as Record<string, unknown>,
                props: { alpha: 1 },
                duration: 250,
                ease: 'easeOutQuad',
              });
              clearTimeout(saveHideTimer);
              saveHideTimer = window.setTimeout(() => {
                c.events.emitSync('tween/to', {
                  target: saveContainer as unknown as Record<string, unknown>,
                  props: { alpha: 0 },
                  duration: 500,
                  ease: 'easeInQuad',
                });
              }, 4200);
            },
          );

          // ── DPR & canvas scaling ────────────────────────────────────────────
          const dpr = window.devicePixelRatio || 1;
          c.app.renderer.resolution = dpr;

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

          c.events.on('game-bootstrap', 'core/destroy', () => {
            window.removeEventListener('resize', scaleCanvas);
            clearTimeout(achHideTimer);
            clearTimeout(saveHideTimer);
            sysLayer.removeChild(achContainer);
            sysLayer.removeChild(saveContainer);
            achContainer.destroy({ children: true });
            saveContainer.destroy({ children: true });
          });

          // ── Camera origin ───────────────────────────────────────────────────
          c.events.emitSync('camera/move', { x: GAME_W / 2, y: GAME_H / 2 });

          // ── Register scenes ─────────────────────────────────────────────────
          c.events.emitSync('scene/register', { scene: TitleScene });
          c.events.emitSync('scene/register', { scene: LevelSelectScene });
          c.events.emitSync('scene/register', { scene: GameScene });
          c.events.emitSync('scene/register', { scene: GameOverScene });
          c.events.emitSync('scene/register', { scene: DevMenuScene });
          c.events.emitSync('scene/register', { scene: EndlessBuffScene });
          c.events.emitSync('scene/register', { scene: CostumeSelectScene });
          c.events.emitSync('scene/register', { scene: AchievementsScene });
          c.events.emitSync('scene/register', { scene: SkillSelectScene });
          c.events.emitSync('scene/register', { scene: StoryScene });
          c.events.emitSync('scene/register', { scene: StoryPrologueScene });
          c.events.emitSync('scene/register', { scene: StoryChapter1Scene });
          c.events.emitSync('scene/register', { scene: StoryChapter1EndScene });
          c.events.emitSync('scene/register', { scene: StoryChapter2Scene });
          c.events.emitSync('scene/register', { scene: StoryChapter2EndScene });
          c.events.emitSync('scene/register', { scene: StoryChapter3Scene });
          c.events.emitSync('scene/register', { scene: StoryChapter3EndScene });
          c.events.emitSync('scene/register', { scene: StoryChapter4Scene });
          c.events.emitSync('scene/register', { scene: StoryChapter4EndScene });
          c.events.emitSync('scene/register', { scene: StoryChapter5Scene });
          c.events.emitSync('scene/register', { scene: StoryChapter5EndScene });
          c.events.emitSync('scene/register', { scene: ModeSelectScene });
          c.events.emitSync('scene/register', { scene: EncyclopediaScene });
          c.events.emitSync('scene/register', { scene: EquipmentScene });

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
