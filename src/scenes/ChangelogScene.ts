import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { APP_VERSION, CHANGELOG } from '../game/changelog';

let _overlay: HTMLElement | null = null;

function renderEntry(entry: (typeof CHANGELOG)[number]): string {
  return `
    <section style="
      background:#0e0e1a;
      border:1px solid #34345c;
      border-left:4px solid #ffd700;
      border-radius:10px;
      padding:14px;
      margin-bottom:12px;
    ">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px;">
        <div>
          <div style="font-size:18px;font-weight:bold;color:#fff;">v${entry.version} · ${entry.title}</div>
          <div style="font-size:12px;color:#aaa;margin-top:2px;">${entry.date}</div>
        </div>
      </div>
      <div style="font-size:13px;color:#ffdd88;font-weight:bold;margin:8px 0 5px;">更新重點</div>
      <ul style="margin:0 0 10px 18px;padding:0;color:#ddd;font-size:12px;line-height:1.6;">
        ${entry.highlights.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <div style="font-size:13px;color:#aaddff;font-weight:bold;margin:8px 0 5px;">詳細內容</div>
      <ul style="margin:0 0 0 18px;padding:0;color:#bbb;font-size:12px;line-height:1.6;">
        ${entry.details.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

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
    'background:rgba(0,0,0,0.88)',
    'z-index:9999',
    'font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif',
  ].join(';');

  const panel = document.createElement('div');
  panel.style.cssText = [
    'background:#090918',
    'border:2px solid #6655cc',
    'border-radius:14px',
    'width:min(360px,92vw)',
    'max-height:86vh',
    'display:flex',
    'flex-direction:column',
    'box-shadow:0 0 32px rgba(88,68,180,0.55)',
    'overflow:hidden',
  ].join(';');

  const header = document.createElement('div');
  header.style.cssText = 'padding:18px 20px 12px;flex-shrink:0;border-bottom:1px solid #1b1b33;';
  header.innerHTML = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#ffd700;text-align:center;">📝 更新日誌</h2>
    <div style="font-size:12px;color:#aaa;text-align:center;">目前版本 v${APP_VERSION}</div>
  `;

  const content = document.createElement('div');
  content.style.cssText = [
    'flex:1',
    'overflow-y:auto',
    'padding:14px 20px',
    '-webkit-overflow-scrolling:touch',
  ].join(';');
  content.innerHTML = `
    <div style="
      background:#101026;
      border:1px solid #333366;
      border-radius:10px;
      padding:12px;
      margin-bottom:12px;
      color:#ccd6ff;
      font-size:12px;
      line-height:1.6;
    ">
      <strong style="color:#ffdd88;">開發提醒：</strong>
      每次功能或內容更新都必須同步調整版本號，並在更新日誌新增一筆條目。
    </div>
    ${CHANGELOG.map(renderEntry).join('')}
  `;

  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 20px 16px;flex-shrink:0;border-top:1px solid #1b1b33;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '← 返回主畫面';
  closeBtn.style.cssText = [
    'width:100%',
    'padding:10px',
    'background:#222233',
    'color:#fff',
    'border:1px solid #6655cc',
    'border-radius:8px',
    'font-size:15px',
    'font-weight:bold',
    'font-family:inherit',
    'cursor:pointer',
  ].join(';');
  footer.appendChild(closeBtn);

  panel.appendChild(header);
  panel.appendChild(content);
  panel.appendChild(footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const openedAt = Date.now();
  closeBtn.addEventListener('click', async () => {
    if (Date.now() - openedAt < 350) return;
    await core.events.emit('scene/load', { key: 'title' });
  });

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

export const ChangelogScene: SceneDescriptor = {
  key: 'changelog',
  enter,
  exit,
};
