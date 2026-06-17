import type { StoryNode } from '../types';

export const STORY_NODES: StoryNode[] = [
  {
    id: 'ch1-031-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '水晶塔入口',
    finalHint: '▶ 開始第 31 關',
    next: { type: 'battle', level: 31 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '這就是水晶塔……祖父的徽記和塔門上的刻痕一模一樣。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '塔還活著。小心那些巡邏的機甲，它們不認得朋友。' },
    ],
  },
  {
    id: 'ch1-032-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '封印協議',
    finalHint: '▶ 開始第 32 關',
    next: { type: 'battle', level: 32 },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '入侵者偵測。封印協議啟動。任何生命體不得接近核心。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我的祖父在裡面！我不是入侵者！' },
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '情感因素無效。威脅等級：消除。' },
    ],
  },
  {
    id: 'ch1-033-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '無效的眼淚',
    finalHint: '▶ 開始第 33 關',
    next: { type: 'battle', level: 33 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '它根本不聽。就算我說祖父快撐不住了也一樣。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '破掉的保護命令，比敵意更難說服。只能先打開路。' },
    ],
  },
  {
    id: 'ch1-034-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '祖父的筆跡',
    finalHint: '▶ 開始第 34 關',
    next: { type: 'battle', level: 34 },
    lines: [
      { speaker: '祖父火雞', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '若封印失控，守衛必須拒絕所有人，包括我。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '這是祖父的筆跡。他早就知道自己可能被困住。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '他不是沒留路。他只是怕你走到這裡。' },
    ],
  },
  {
    id: 'ch1-035-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '水晶守衛試煉',
    finalHint: '▶ 開始第 35 關',
    next: { type: 'battle', level: 35 },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '核心室封鎖。最後防線展開。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '如果你的命令是保護，那就看清楚我要保護的人！' },
    ],
  },
  {
    id: 'ch1-035-post',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '破損協議',
    finalHint: '▶ 前往第 36 關',
    next: { type: 'story', nodeId: 'ch1-036-pre' },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '錯誤……保護對象資料遺失……火雞博士……請重新輸入命令……' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '它剛剛叫祖父博士。勇氣，我們離真相越來越近了。' },
    ],
  },
  {
    id: 'ch1-036-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '故障的保護',
    finalHint: '▶ 開始第 36 關',
    next: { type: 'battle', level: 36 },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '孩子不應靠近裂隙……孩子不應背負錯誤……重複……重複……' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那是祖父留下的話。可是我已經走到這裡了。' },
    ],
  },
  {
    id: 'ch1-037-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '幻影的交易',
    finalHint: '▶ 開始第 37 關',
    next: { type: 'battle', level: 37 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '我知道一條捷徑。交換條件：給我一段你不需要的記憶。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '不准答應影子的交易。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我不給記憶。但如果你想知道自己是誰，就跟上來看。' },
    ],
  },
  {
    id: 'ch1-038-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '勇氣不相信幻影',
    finalHint: '▶ 開始第 38 關',
    next: { type: 'battle', level: 38 },
    lines: [
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '它偷過你的記憶。你真的要讓它走在背後？' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '放心，我現在比較想偷混沌藏起來的那段。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那就暫時同路。誰亂來，我第一個打誰。' },
    ],
  },
  {
    id: 'ch1-039-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '塔心鑰匙',
    finalHint: '▶ 開始第 39 關',
    next: { type: 'battle', level: 39 },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '塔心鑰匙封存。未授權者接近，防衛節點啟動。' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '好多鎖。祖父火雞真會把秘密藏得像寶貝。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那就一把一把打開。' },
    ],
  },
  {
    id: 'ch1-040-pre',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '守衛的最後命令',
    finalHint: '▶ 開始第 40 關',
    next: { type: 'battle', level: 40 },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '最終判定：星火持有者具備核心接近權。測試仍須完成。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你要打，我就打。但打完之後，請把祖父的位置告訴我。' },
    ],
  },
  {
    id: 'ch1-040-post',
    chapterLabel: '第一章 · 水晶塔試煉',
    title: '塔內地圖',
    finalHint: '▶ 前往第 41 關',
    next: { type: 'story', nodeId: 'ch1-041-pre' },
    lines: [
      { speaker: '水晶守衛', portrait: 'mech', accentColor: 0x44ddff, side: 'right', text: '測試完成。火雞博士位置：虛空門扉旁。警告：裂隙活動上升。' },
      { speaker: '祖父的聲音', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '孫兒……如果門醒了，先救星空，不要先救我……' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我不要二選一。我會找到第三條路。' },
    ],
  },
];
