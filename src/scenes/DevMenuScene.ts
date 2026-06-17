import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { devConfig } from '../game/store';
import { clearProgress, exportProgress, importProgress } from '../game/persistence';
import { PLAYER_MOVE_SPEED, ITEM_FALL_SPEED } from '../constants';
import { TEXT } from '../game/i18n';

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
    'padding:22px',
    'width:min(360px,calc(100vw - 32px))',
    'max-height:86vh',
    'box-sizing:border-box',
    'overflow-y:auto',
    'color:#ffffff',
    'box-shadow:0 0 24px rgba(255,100,68,0.5)',
  ].join(';');

  panel.innerHTML = `
    <h2 style="margin:0 0 18px;font-size:20px;color:#ffd700;text-align:center;">
      🛠 開發者選單
    </h2>

    <section style="background:#111126;border:1px solid #333355;border-radius:10px;padding:14px;margin-bottom:14px;">
      <label style="display:flex;justify-content:space-between;gap:12px;margin-bottom:8px;font-size:14px;color:#ffccaa;">
        <span>小雞移動速度</span>
        <span id="dev-speed-val" style="color:#ffee44;font-weight:bold;white-space:nowrap;">
          ${devConfig.playerMoveSpeed} px/s
        </span>
      </label>
      <input id="dev-speed" type="range"
        min="100" max="800" step="10"
        value="${devConfig.playerMoveSpeed}"
        style="width:100%;accent-color:#ff6644;"
      />
    </section>

    <section style="background:#111126;border:1px solid #333355;border-radius:10px;padding:14px;margin-bottom:14px;">
      <label style="display:flex;justify-content:space-between;gap:12px;margin-bottom:8px;font-size:14px;color:#ffccaa;">
        <span>道具下落速度</span>
        <span id="dev-fall-val" style="color:#ffee44;font-weight:bold;white-space:nowrap;">
          ${devConfig.itemFallSpeed} px/s
        </span>
      </label>
      <input id="dev-fall" type="range"
        min="20" max="600" step="10"
        value="${devConfig.itemFallSpeed}"
        style="width:100%;accent-color:#ff6644;"
      />
    </section>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;">
      <button id="dev-reset"
        style="padding:10px 12px;background:#444;color:#fff;border:1px solid #888;border-radius:8px;cursor:pointer;font-size:14px;">
        重置預設值
      </button>
      <button id="dev-close"
        style="padding:10px 12px;background:#cc2200;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:bold;">
        關閉
      </button>
    </div>

    <hr style="border:none;border-top:1px solid #444;margin:18px 0;" />

    <section style="background:#101624;border:1px solid #263a55;border-radius:10px;padding:14px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <button id="dev-export"
        style="padding:10px 12px;background:#1a4a2e;color:#aaffcc;border:1px solid #33aa66;border-radius:8px;cursor:pointer;font-size:14px;">
        📤 匯出存檔資料
      </button>
      <button id="dev-import"
        style="padding:10px 12px;background:#1a2e4a;color:#aaccff;border:1px solid #3366aa;border-radius:8px;cursor:pointer;font-size:14px;">
        📥 匯入存檔資料
      </button>
      </div>
      <input id="dev-import-file" type="file" accept=".json" style="display:none;" />
      <p id="dev-import-status" style="display:none;margin:10px 0 0;font-size:13px;color:#aaccff;"></p>
    </section>

    <hr style="border:none;border-top:1px solid #444;margin:18px 0;" />

    <section style="background:#221010;border:1px solid #553333;border-radius:10px;padding:14px;text-align:center;">
      <button id="dev-clear-data"
        style="width:100%;padding:10px 12px;background:#7a1010;color:#ffcccc;border:1px solid #cc3333;border-radius:8px;cursor:pointer;font-size:14px;">
        🗑 刪除存檔資料
      </button>
      <p id="dev-clear-confirm" style="display:none;margin:10px 0 0;font-size:13px;color:#ffaaaa;">
        確定要刪除所有存檔？此操作無法復原。
        <br/>
        <span style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
          <button id="dev-clear-yes"
            style="padding:8px 12px;background:#cc0000;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:bold;">
            確認刪除
          </button>
          <button id="dev-clear-no"
            style="padding:8px 12px;background:#444;color:#fff;border:1px solid #888;border-radius:8px;cursor:pointer;font-size:13px;">
            取消
          </button>
        </span>
      </p>
    </section>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // ── Wire up controls ──────────────────────────────────────────────────────
  const speedSlider = panel.querySelector<HTMLInputElement>('#dev-speed')!;
  const speedVal    = panel.querySelector<HTMLElement>('#dev-speed-val')!;
  const fallSlider  = panel.querySelector<HTMLInputElement>('#dev-fall')!;
  const fallVal     = panel.querySelector<HTMLElement>('#dev-fall-val')!;
  const resetBtn    = panel.querySelector<HTMLButtonElement>('#dev-reset')!;
  const closeBtn    = panel.querySelector<HTMLButtonElement>('#dev-close')!;
  const clearDataBtn    = panel.querySelector<HTMLButtonElement>('#dev-clear-data')!;
  const clearConfirm    = panel.querySelector<HTMLElement>('#dev-clear-confirm')!;
  const clearYesBtn     = panel.querySelector<HTMLButtonElement>('#dev-clear-yes')!;
  const clearNoBtn      = panel.querySelector<HTMLButtonElement>('#dev-clear-no')!;
  const exportBtn       = panel.querySelector<HTMLButtonElement>('#dev-export')!;
  const importBtn       = panel.querySelector<HTMLButtonElement>('#dev-import')!;
  const importFileInput = panel.querySelector<HTMLInputElement>('#dev-import-file')!;
  const importStatus    = panel.querySelector<HTMLElement>('#dev-import-status')!;

  function setStatus(message: string, color: string): void {
    importStatus.style.display = 'block';
    importStatus.style.color = color;
    importStatus.textContent = message;
  }

  speedSlider.addEventListener('input', () => {
    devConfig.playerMoveSpeed = Number(speedSlider.value);
    speedVal.textContent = `${devConfig.playerMoveSpeed} px/s`;
  });

  fallSlider.addEventListener('input', () => {
    devConfig.itemFallSpeed = Number(fallSlider.value);
    fallVal.textContent = `${devConfig.itemFallSpeed} px/s`;
  });

  resetBtn.addEventListener('click', () => {
    devConfig.playerMoveSpeed = PLAYER_MOVE_SPEED;
    speedSlider.value = String(PLAYER_MOVE_SPEED);
    speedVal.textContent = `${PLAYER_MOVE_SPEED} px/s`;
    devConfig.itemFallSpeed = ITEM_FALL_SPEED;
    fallSlider.value = String(ITEM_FALL_SPEED);
    fallVal.textContent = `${ITEM_FALL_SPEED} px/s`;
  });

  closeBtn.addEventListener('click', async () => {
    await core.events.emit('scene/load', { key: 'title' });
  });

  clearDataBtn.addEventListener('click', () => {
    clearDataBtn.style.display = 'none';
    clearConfirm.style.display = 'block';
  });

  clearNoBtn.addEventListener('click', () => {
    clearConfirm.style.display = 'none';
    clearDataBtn.style.display = 'inline-block';
  });

  clearYesBtn.addEventListener('click', async () => {
    const result = await clearProgress();
    if (result.ok) {
      setStatus(TEXT.persistence.clearSuccess, '#aaffcc');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setStatus(TEXT.persistence.clearFailure(result.message), '#ffaaaa');
      clearConfirm.style.display = 'none';
      clearDataBtn.style.display = 'inline-block';
    }
  });

  exportBtn.addEventListener('click', () => {
    const result = exportProgress();
    if (result.ok) {
      setStatus(TEXT.persistence.exportSuccess, '#aaffcc');
    } else {
      setStatus(TEXT.persistence.exportFailure(result.message), '#ffaaaa');
    }
  });

  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', async () => {
    const file = importFileInput.files?.[0];
    if (!file) return;
    setStatus('⏳ 正在匯入...', '#aaccff');
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      const result = await importProgress(data);
      if (result.ok) {
        setStatus(TEXT.persistence.importSuccess, '#aaffcc');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatus(TEXT.persistence.importFailure(result.message), '#ffaaaa');
      }
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : TEXT.persistence.invalidImportFile;
      setStatus(TEXT.persistence.importFailure(message), '#ffaaaa');
    }
    // Reset file input so the same file can be re-selected if needed.
    importFileInput.value = '';
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
