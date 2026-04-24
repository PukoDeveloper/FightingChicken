import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { Rectangle } from 'pixi.js';
import type { Container } from 'pixi.js';
import {
  createCourageDisplay,
  createPhantomDisplay,
  createChaosDisplay,
  createPetDisplay,
} from '../game/sprites';

// ─── Encyclopedia (圖鑑) overlay ─────────────────────────────────────────────
// Rendered as an HTML panel (same technique as DevMenuScene) so that we can
// use native scrolling, CSS layout, and rich text without a custom PIXI UI.

let _overlay: HTMLElement | null = null;

// ─── Sprite-to-image helper ───────────────────────────────────────────────────

/**
 * Render a PIXI Container (created by `factory`) into an HTMLCanvasElement and
 * return its PNG data URL.  A square frame centred on the container's local
 * origin is extracted so that the sprite appears at full size.
 */
function spriteToDataUrl(
  renderer: ReturnType<typeof import('pixi.js').autoDetectRenderer> extends Promise<infer R> ? R : never,
  factory: () => Container,
  frameSize: number,
): string {
  const container = factory();
  const half = frameSize / 2;
  const icanvas = renderer.extract.canvas({
    target: container,
    frame: new Rectangle(-half, -half, frameSize, frameSize),
    clearColor: [0, 0, 0, 0],
    antialias: true,
  });
  const dataUrl = (icanvas as HTMLCanvasElement).toDataURL('image/png');
  container.destroy({ children: true });
  return dataUrl;
}

// ─── Content data ─────────────────────────────────────────────────────────────

interface BossEntry {
  name: string;
  subtitle: string;
  color: string;
  borderColor: string;
  levels: string;
  hp: string;
  description: string;
  weakness: string;
}

interface AttackEntry {
  name: string;
  icon: string;
  color: string;
  description: string;
  tip: string;
}

interface EntityEntry {
  name: string;
  color: string;
  borderColor: string;
  appearsIn: string;
  description: string;
  tip: string;
}

const BOSSES: BossEntry[] = [
  {
    name: '勇氣',
    subtitle: 'Courage',
    color: '#2a0808',
    borderColor: '#cc2200',
    levels: '第 1 — 3 關',
    hp: '200',
    description:
      '憤怒的紅色惡魔，以螺旋彈與瞄準彈為主要攻擊手段。' +
      '血量愈低、攻擊密度愈高，進入第三階段後子彈速度大幅提升。',
    weakness: '把握每次攻擊間隔中的空隙，橫向位移閃躲螺旋彈。',
  },
  {
    name: '幽靈',
    subtitle: 'Phantom',
    color: '#06061e',
    borderColor: '#3355dd',
    levels: '第 4 關',
    hp: '210',
    description:
      '幽靈般的藍紫色實體，擅長以散射彈覆蓋大範圍，' +
      '並釋放陷阱泡泡大幅降低移動速度，使玩家難以閃避後續攻擊。',
    weakness: '優先躲避泡泡陷阱，被困後迅速朝邊緣移動擴大迴旋空間。',
  },
  {
    name: '混沌',
    subtitle: 'Chaos',
    color: '#120012',
    borderColor: '#880088',
    levels: '第 5 關',
    hp: '280',
    description:
      '擁有無數眼睛的黑暗實體，幾乎使用所有已知攻擊類型：' +
      '螺旋彈、環形彈、衝擊波、炸彈、雷射柱、追蹤彈…' +
      '並在第三階段召喚寵物護衛協同作戰。',
    weakness: '保留技能至第三階段；擊殺寵物護衛可減少子彈密度。',
  },
];

const ATTACKS: AttackEntry[] = [
  {
    name: '螺旋彈',
    icon: '🌀',
    color: '#ff4444',
    description: '以旋轉角度連續射出多道子彈，形成覆蓋廣泛的螺旋彈幕。隨著階段提升，發射間隔縮短、子彈道數增多。',
    tip: '沿著螺旋的「縫隙」穿越，避免逆著旋轉方向移動。',
  },
  {
    name: '瞄準彈',
    icon: '🎯',
    color: '#ff8800',
    description: '朝玩家當前位置精確射出子彈，多組同時發射時會形成扇形包夾。',
    tip: '子彈發射前微微移動，讓瞄準方向偏離後再躲入空隙。',
  },
  {
    name: '散射彈',
    icon: '💥',
    color: '#ffcc00',
    description: '朝特定方向同時射出多顆呈扇形分布的子彈，覆蓋一定角度範圍。',
    tip: '靠近扇形邊緣移動，利用最小角度的空隙通過。',
  },
  {
    name: '環形彈',
    icon: '⭕',
    color: '#44ccff',
    description: '以 BOSS 為圓心、向四面八方同時射出一圈子彈，幾乎封鎖所有方向。',
    tip: '保持在 BOSS 正下方；環形彈發射瞬間向側邊短距離衝刺。',
  },
  {
    name: '衝擊波',
    icon: '🟡',
    color: '#ffee00',
    description: '向外擴張的黃色光環，接觸即造成傷害。速度固定，無法射擊消除。',
    tip: '衝擊波發出時立即遠離 BOSS；衝擊波通過後再跟進攻擊。',
  },
  {
    name: '陷阱泡泡',
    icon: '🫧',
    color: '#44ddff',
    description: '緩慢飛向玩家的青色泡泡，命中後使移動速度降至正常的 22% 長達 2.5 秒。',
    tip: '優先閃避泡泡；被捕後貼著畫面邊緣微移，等待解除。',
  },
  {
    name: '延遲炸彈',
    icon: '💣',
    color: '#ff7700',
    description: '橙色炸彈落地後計時引爆，爆炸產生一圈子彈向外擴散。留意落點位置並提前離開。',
    tip: '記住炸彈落點，爆炸前確保已離開爆炸環覆蓋範圍。',
  },
  {
    name: '雷射柱',
    icon: '⚡',
    color: '#00ffff',
    description: '從畫面頂端射下的亮藍色子彈列，以固定欄寬覆蓋橫向區域。多欄同時落下時難以閃躲。',
    tip: '找出兩欄雷射之間的安全間隙，快速左右穿越。',
  },
  {
    name: '追蹤彈',
    icon: '🌸',
    color: '#ff44cc',
    description: '粉色子彈持續轉向追蹤玩家，轉彎速度有限，大幅繞行可甩開追蹤。',
    tip: '以大圓弧繞行讓追蹤彈失去慣性，射擊時需預留閃躲空間。',
  },
];

const ENTITIES: EntityEntry[] = [
  {
    name: '寵物護衛',
    color: '#1a0028',
    borderColor: '#880088',
    appearsIn: '第 5 關（混沌）— 第三階段',
    description:
      '混沌 BOSS 在第三階段召喚的紫色守護生物。' +
      '擁有四眼菱形排列的複眼結構，並有小型羽翼。' +
      '獨立射擊子彈，與 BOSS 的攻擊疊加，大幅提高全螢幕子彈密度。',
    tip: '優先集中火力擊滅寵物護衛以恢復喘息空間；HP 較低，數發即可擊殺。',
  },
];

// ─── HTML generation ──────────────────────────────────────────────────────────

function renderBossCard(b: BossEntry, spriteDataUrl: string): string {
  return `
    <div style="
      background:${b.color};
      border:2px solid ${b.borderColor};
      border-radius:12px;
      padding:16px;
      margin-bottom:14px;
    ">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <img src="${spriteDataUrl}" width="64" height="64" style="image-rendering:pixelated;flex-shrink:0;" alt="${b.name}">
        <div>
          <div style="font-size:20px;font-weight:bold;color:#ffffff;">${b.name}</div>
          <div style="font-size:12px;color:#aaaaaa;">${b.subtitle}</div>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <div style="font-size:12px;color:#ffccaa;">${b.levels}</div>
          <div style="font-size:12px;color:#aaaaaa;">HP: ${b.hp}</div>
        </div>
      </div>
      <p style="font-size:13px;color:#dddddd;line-height:1.6;margin:0 0 8px;">${b.description}</p>
      <div style="
        background:rgba(255,255,255,0.05);
        border-left:3px solid ${b.borderColor};
        padding:6px 10px;
        border-radius:0 6px 6px 0;
        font-size:12px;
        color:#ffeecc;
        line-height:1.5;
      ">💡 攻略提示：${b.weakness}</div>
    </div>
  `;
}

function renderAttackCard(a: AttackEntry): string {
  return `
    <div style="
      background:#0e0e1a;
      border:1px solid #2a2a44;
      border-left:4px solid ${a.color};
      border-radius:8px;
      padding:12px 14px;
      margin-bottom:10px;
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:22px;">${a.icon}</span>
        <span style="font-size:16px;font-weight:bold;color:${a.color};">${a.name}</span>
      </div>
      <p style="font-size:12px;color:#cccccc;line-height:1.6;margin:0 0 6px;">${a.description}</p>
      <p style="font-size:12px;color:#ffddaa;margin:0;">💡 ${a.tip}</p>
    </div>
  `;
}

function renderEntityCard(e: EntityEntry, spriteDataUrl: string): string {
  return `
    <div style="
      background:${e.color};
      border:2px solid ${e.borderColor};
      border-radius:12px;
      padding:16px;
      margin-bottom:14px;
    ">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <img src="${spriteDataUrl}" width="64" height="64" style="image-rendering:pixelated;flex-shrink:0;" alt="${e.name}">
        <div>
          <div style="font-size:20px;font-weight:bold;color:#ffffff;">${e.name}</div>
          <div style="font-size:12px;color:#ccaacc;">${e.appearsIn}</div>
        </div>
      </div>
      <p style="font-size:13px;color:#dddddd;line-height:1.6;margin:0 0 8px;">${e.description}</p>
      <div style="
        background:rgba(255,255,255,0.05);
        border-left:3px solid ${e.borderColor};
        padding:6px 10px;
        border-radius:0 6px 6px 0;
        font-size:12px;
        color:#ffeecc;
        line-height:1.5;
      ">💡 攻略提示：${e.tip}</div>
    </div>
  `;
}

// ─── Scene lifecycle ──────────────────────────────────────────────────────────

async function enter(core: Core): Promise<void> {
  const renderer = core.app.renderer;

  // Render each boss/entity sprite to a PNG data URL so the encyclopedia
  // shows the actual in-game appearance instead of emoji placeholders.
  const bossImgs = [
    spriteToDataUrl(renderer as Parameters<typeof spriteToDataUrl>[0], createCourageDisplay, 130),
    spriteToDataUrl(renderer as Parameters<typeof spriteToDataUrl>[0], createPhantomDisplay, 130),
    spriteToDataUrl(renderer as Parameters<typeof spriteToDataUrl>[0], createChaosDisplay, 140),
  ];
  const entityImgs = [
    spriteToDataUrl(renderer as Parameters<typeof spriteToDataUrl>[0], createPetDisplay, 72),
  ];

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
    'background:#0a0a1a',
    'border:2px solid #5544aa',
    'border-radius:14px',
    'width:min(360px,92vw)',
    'max-height:86vh',
    'display:flex',
    'flex-direction:column',
    'box-shadow:0 0 32px rgba(88,68,180,0.55)',
    'overflow:hidden',
  ].join(';');

  // ── Header ──────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.style.cssText = [
    'padding:18px 20px 0',
    'flex-shrink:0',
  ].join(';');
  header.innerHTML = `
    <h2 style="margin:0 0 14px;font-size:20px;color:#ffd700;text-align:center;">
      📖 圖鑑
    </h2>
  `;

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const tabBar = document.createElement('div');
  tabBar.style.cssText = [
    'display:flex',
    'gap:6px',
    'padding:0 20px 12px',
    'flex-shrink:0',
  ].join(';');

  const TABS = [
    { id: 'boss',   label: '⚔️ BOSS' },
    { id: 'attack', label: '💥 攻擊方式' },
    { id: 'entity', label: '👾 其他實體' },
  ];

  const tabBtns: HTMLButtonElement[] = [];

  TABS.forEach(tab => {
    const btn = document.createElement('button');
    btn.dataset['tab'] = tab.id;
    btn.textContent = tab.label;
    btn.style.cssText = [
      'flex:1',
      'padding:7px 4px',
      'border-radius:8px',
      'border:1px solid #333355',
      'background:#111128',
      'color:#999',
      'font-size:12px',
      'font-family:inherit',
      'cursor:pointer',
      'transition:all 0.15s',
    ].join(';');
    tabBtns.push(btn);
    tabBar.appendChild(btn);
  });

  // ── Content panes ─────────────────────────────────────────────────────────
  const contentArea = document.createElement('div');
  contentArea.style.cssText = [
    'flex:1',
    'overflow-y:auto',
    'padding:0 20px',
    '-webkit-overflow-scrolling:touch',
  ].join(';');

  const panes: Record<string, HTMLDivElement> = {
    boss:   document.createElement('div'),
    attack: document.createElement('div'),
    entity: document.createElement('div'),
  };

  panes.boss.innerHTML   = BOSSES.map((b, i) => renderBossCard(b, bossImgs[i])).join('');
  panes.attack.innerHTML = ATTACKS.map(renderAttackCard).join('');
  panes.entity.innerHTML = ENTITIES.map((e, i) => renderEntityCard(e, entityImgs[i])).join('');

  Object.values(panes).forEach(p => {
    p.style.cssText = 'padding-top:4px;padding-bottom:8px;display:none;';
    contentArea.appendChild(p);
  });

  // ── Close button ─────────────────────────────────────────────────────────
  const footer = document.createElement('div');
  footer.style.cssText = [
    'padding:12px 20px 16px',
    'flex-shrink:0',
    'border-top:1px solid #1a1a2e',
  ].join(';');

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '← 返回';
  closeBtn.style.cssText = [
    'width:100%',
    'padding:10px',
    'background:#222233',
    'color:#fff',
    'border:1px solid #5544aa',
    'border-radius:8px',
    'font-size:15px',
    'font-weight:bold',
    'font-family:inherit',
    'cursor:pointer',
  ].join(';');

  footer.appendChild(closeBtn);

  // ── Assemble ──────────────────────────────────────────────────────────────
  panel.appendChild(header);
  panel.appendChild(tabBar);
  panel.appendChild(contentArea);
  panel.appendChild(footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // ── Tab switching logic ───────────────────────────────────────────────────
  let activeTab = 'boss';

  function switchTab(tabId: string): void {
    activeTab = tabId;
    tabBtns.forEach(btn => {
      const isActive = btn.dataset['tab'] === tabId;
      btn.style.background  = isActive ? '#2a1f66'  : '#111128';
      btn.style.color        = isActive ? '#ffd700'  : '#999';
      btn.style.borderColor  = isActive ? '#5544aa'  : '#333355';
      btn.style.fontWeight   = isActive ? 'bold'     : 'normal';
    });
    Object.entries(panes).forEach(([id, pane]) => {
      pane.style.display = id === tabId ? 'block' : 'none';
    });
    contentArea.scrollTop = 0;
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset['tab'];
      if (tabId) switchTab(tabId);
    });
  });

  switchTab('boss');

  // ── Navigation ────────────────────────────────────────────────────────────
  const openedAt = Date.now();
  closeBtn.addEventListener('click', async () => {
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

export const EncyclopediaScene: SceneDescriptor = {
  key: 'encyclopedia',
  enter,
  exit,
};
