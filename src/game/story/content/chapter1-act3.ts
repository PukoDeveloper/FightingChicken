import type { StoryNode } from '../types';

export const STORY_NODES: StoryNode[] = [
  {
    id: 'ch1-021-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '黑潮邊界',
    finalHint: '▶ 開始第 21 關',
    next: { type: 'battle', level: 21 },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '歡迎，小小星火。你終於帶著一身裂縫來到我面前。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你就是讓幻影偷走記憶的人？' },
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '我只是替你們保存不敢承認的東西。' },
    ],
  },
  {
    id: 'ch1-022-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '勇氣的失敗',
    finalHint: '▶ 開始第 22 關',
    next: { type: 'battle', level: 22 },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '問問你的守門者吧。牠曾經放行一個自稱勇敢的傻瓜。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '那個傻瓜打開了裂隙。我沒能阻止。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你不是因為討厭我才攔我。你是在害怕重來一次。' },
    ],
  },
  {
    id: 'ch1-023-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '不只是救人',
    finalHint: '▶ 開始第 23 關',
    next: { type: 'battle', level: 23 },
    lines: [
      { speaker: '祖父的聲音', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '孫兒……如果看見水晶塔，先不要碰核心。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '祖父聽起來不像只是被抓走。他像在守著什麼。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '救人和守門，有時候會站在相反方向。' },
    ],
  },
  {
    id: 'ch1-024-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '混沌低語',
    finalHint: '▶ 開始第 24 關',
    next: { type: 'battle', level: 24 },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '你想救祖父，是因為愛，還是因為不能忍受自己被留下？' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '兩個都有。可我不會因為答案不好看，就把手放開。' },
    ],
  },
  {
    id: 'ch1-025-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '混沌的降臨',
    finalHint: '▶ 開始第 25 關',
    next: { type: 'battle', level: 25 },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '好。那就讓我看看，你承認的恐懼能不能活過真正的黑潮。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '別被它的話帶著跑。看彈幕，看呼吸。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我看得見。我也還走得動。' },
    ],
  },
  {
    id: 'ch1-025-post',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '黑潮退後一步',
    finalHint: '▶ 前往第 26 關',
    next: { type: 'story', nodeId: 'ch1-026-pre' },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '你沒有碎。真可惜，也真有趣。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我會害怕，但我不會讓你替我解釋害怕。' },
    ],
  },
  {
    id: 'ch1-026-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '分歧的同伴',
    finalHint: '▶ 開始第 26 關',
    next: { type: 'battle', level: 26 },
    lines: [
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '如果祖父真的是封印的一部分，你不能只想著把他拉出來。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '所以你要我放棄他？' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '我要你先知道門後面是什麼。' },
    ],
  },
  {
    id: 'ch1-027-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '一個人的星路',
    finalHint: '▶ 開始第 27 關',
    next: { type: 'battle', level: 27 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我自己也能走。只是……少了那個吵死人的聲音，星路好安靜。' },
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '安靜很好。安靜時，你就會聽見自己其實多想怪他。' },
    ],
  },
  {
    id: 'ch1-028-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '勇氣的真名',
    finalHint: '▶ 開始第 28 關',
    next: { type: 'battle', level: 28 },
    lines: [
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '我回來，不是因為你需要我。是因為我也害怕一個人面對那座塔。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你剛剛說你害怕？' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '只說一次。笑出來我就把你丟進黑潮。' },
    ],
  },
  {
    id: 'ch1-029-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '混沌的真話',
    finalHint: '▶ 開始第 29 關',
    next: { type: 'battle', level: 29 },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '你的祖父用同伴的記憶填補封印裂縫。這不是謊言。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '也不是全部。你只把最痛的那一半拿出來。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '所以我們去找另一半。' },
    ],
  },
  {
    id: 'ch1-030-pre',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '重新同行',
    finalHint: '▶ 開始第 30 關',
    next: { type: 'battle', level: 30 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我不會放棄祖父，也不會假裝代價不存在。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '那就是同行的條件。想衝時我拉你，想退時你推我。' },
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '真感人。讓我看看這份信任能撐多久。' },
    ],
  },
  {
    id: 'ch1-030-post',
    chapterLabel: '第一章 · 混沌的降臨',
    title: '塔的座標',
    finalHint: '▶ 前往第 31 關',
    next: { type: 'story', nodeId: 'ch1-031-pre' },
    lines: [
      { speaker: '混沌', portrait: 'chaos', accentColor: 0xcc44ff, side: 'right', text: '水晶塔就在前方。去吧，去親眼看見你祖父留下的傷口。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '如果那是傷口，我就找到包紮它的方法。' },
    ],
  },
];
