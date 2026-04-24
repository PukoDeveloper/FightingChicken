import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { devConfig } from '../game/store';
import { PLAYER_MOVE_SPEED, ITEM_FALL_SPEED } from '../constants';

// ─── DevMenu overlay (HTML) ──────────────────────────────────────────────────
// Renders a simple HTML panel on top of the canvas so we can use native
// <input type="range"> controls without needing a custom PIXI UI library.

// ─── DevMenu overlay (HTML) ──────────────────────────────────────────────────
// Renders a simple HTML panel on top of the canvas so we can use native
// <input type="range"> controls without needing a custom PIXI UI library.

let _overlay: HTMLElement | null = null;

async function enter(core: Core): Promise<void> {
  const overlay = document.createElement('div');
  _overlay = overlay;

  overlay.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100%',
    'height:100%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'background:rgba(0,0,0,0.75)',
    'z-index:9999',
    'font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif',
  ].join(';');

  const panel = document.createElement('div');
  panel.style.cssText = [
    'background:#1a1a2e',
    'border:2px solid #ff6644',
    'border-radius:12px',
    'padding:28px 32px',
    'min-width:280px',
    'max-width:90vw',
    'color:#ffffff',
    'box-shadow:0 0 24px rgba(255,100,68,0.5)',
  ].join(';');

  panel.innerHTML = `
    <h2 style="margin:0 0 20px;font-size:20px;color:#ffd700;text-align:center;">
      🛠 開發者選單
    </h2>

    <label style="display:block;margin-bottom:6px;font-size:14px;color:#ffccaa;">
      小雞移動速度
      <span id="dev-speed-val" style="margin-left:8px;color:#ffee44;font-weight:bold;">
        ${devConfig.playerMoveSpeed} px/s
      </span>
    </label>
    <input id="dev-speed" type="range"
      min="100" max="800" step="10"
      value="${devConfig.playerMoveSpeed}"
      style="width:100%;margin-bottom:16px;accent-color:#ff6644;"
    />

    <label style="display:block;margin-bottom:6px;font-size:14px;color:#ffccaa;">
      道具下落速度
      <span id="dev-fall-val" style="margin-left:8px;color:#ffee44;font-weight:bold;">
        ${devConfig.itemFallSpeed} px/s
      </span>
    </label>
    <input id="dev-fall" type="range"
      min="20" max="600" step="10"
      value="${devConfig.itemFallSpeed}"
      style="width:100%;margin-bottom:16px;accent-color:#ff6644;"
    />

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <input id="dev-story-toggle" type="checkbox"
        ${devConfig.storyModeEnabled ? 'checked' : ''}
        style="width:18px;height:18px;accent-color:#ff6644;cursor:pointer;flex-shrink:0;"
      />
      <label for="dev-story-toggle" style="font-size:14px;color:#ffccaa;cursor:pointer;">
        啟用故事模式（主畫面顯示故事模式按鈕）
      </label>
    </div>

    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
      <button id="dev-reset"
        style="padding:8px 16px;background:#444;color:#fff;border:1px solid #888;border-radius:6px;cursor:pointer;font-size:14px;">
        重置預設值
      </button>
      <button id="dev-close"
        style="padding:8px 16px;background:#cc2200;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold;">
        關閉
      </button>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // ── Wire up controls ──────────────────────────────────────────────────────
  const speedSlider = panel.querySelector<HTMLInputElement>('#dev-speed')!;
  const speedVal    = panel.querySelector<HTMLElement>('#dev-speed-val')!;
  const fallSlider  = panel.querySelector<HTMLInputElement>('#dev-fall')!;
  const fallVal     = panel.querySelector<HTMLElement>('#dev-fall-val')!;
  const storyToggle = panel.querySelector<HTMLInputElement>('#dev-story-toggle')!;
  const resetBtn    = panel.querySelector<HTMLButtonElement>('#dev-reset')!;
  const closeBtn    = panel.querySelector<HTMLButtonElement>('#dev-close')!;

  speedSlider.addEventListener('input', () => {
    devConfig.playerMoveSpeed = Number(speedSlider.value);
    speedVal.textContent = `${devConfig.playerMoveSpeed} px/s`;
  });

  fallSlider.addEventListener('input', () => {
    devConfig.itemFallSpeed = Number(fallSlider.value);
    fallVal.textContent = `${devConfig.itemFallSpeed} px/s`;
  });

  storyToggle.addEventListener('change', () => {
    devConfig.storyModeEnabled = storyToggle.checked;
  });

  resetBtn.addEventListener('click', () => {
    devConfig.playerMoveSpeed = PLAYER_MOVE_SPEED;
    speedSlider.value = String(PLAYER_MOVE_SPEED);
    speedVal.textContent = `${PLAYER_MOVE_SPEED} px/s`;
    devConfig.itemFallSpeed = ITEM_FALL_SPEED;
    fallSlider.value = String(ITEM_FALL_SPEED);
    fallVal.textContent = `${ITEM_FALL_SPEED} px/s`;
    devConfig.storyModeEnabled = false;
    storyToggle.checked = false;
  });

  closeBtn.addEventListener('click', async () => {
    await core.events.emit('scene/load', { key: 'title' });
  });

  // Close on clicking the dark backdrop (outside the panel).
  // Guard with a short delay so a tap that opened this menu can't immediately
  // close it via the phantom 'click' event that follows pointerup.
  const openedAt = Date.now();
  overlay.addEventListener('click', async (e) => {
    if (Date.now() - openedAt < 350) return;
    if (e.target === overlay) {
      await core.events.emit('scene/load', { key: 'title' });
    }
  });
}

async function exit(_core: Core): Promise<void> {
  _overlay?.remove();
  _overlay = null;
}

export const DevMenuScene: SceneDescriptor = {
  key: 'devmenu',
  enter,
  exit,
};
