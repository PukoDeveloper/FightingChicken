import type { StoryNode } from '../types';

export const STORY_NODES: StoryNode[] = [
  {
    id: 'ch1-011-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '幽光森林',
    finalHint: '▶ 開始第 11 關',
    next: { type: 'battle', level: 11 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '這座森林的樹葉……每一片都像祖父以前講過的故事。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '別伸手。幽光森林會把懷念變成籠子。' },
    ],
  },
  {
    id: 'ch1-012-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '假祖父',
    finalHint: '▶ 開始第 12 關',
    next: { type: 'battle', level: 12 },
    lines: [
      { speaker: '祖父的聲音', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '回家吧，孫兒。你救不了我，也不必救我。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你不是祖父。祖父會先問我有沒有吃飽。' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '小細節真麻煩。不過越麻煩的記憶，越鮮甜。' },
    ],
  },
  {
    id: 'ch1-013-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '勇氣的沉默',
    finalHint: '▶ 開始第 13 關',
    next: { type: 'battle', level: 13 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你聽到混沌的名字時，臉色變了。你到底知道什麼？' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '知道太早，只會讓你走不動。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我討厭被保護到什麼都不知道。' },
    ],
  },
  {
    id: 'ch1-014-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '記憶碎片二',
    finalHint: '▶ 開始第 14 關',
    next: { type: 'battle', level: 14 },
    lines: [
      { speaker: '祖父火雞', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '如果有一天水晶塔再次亮起，別讓孩子靠近。那不是牠該背的錯。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '水晶塔？祖父，你以前到底做過什麼？' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '你看，記憶比謊言更會傷人。' },
    ],
  },
  {
    id: 'ch1-015-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '幻影之謎',
    finalHint: '▶ 開始第 15 關',
    next: { type: 'battle', level: 15 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '把你的童年借我吧。反正你只會拿它哭。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我會哭，也會打。兩件事不衝突！' },
    ],
  },
  {
    id: 'ch1-015-post',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '被偷走的溫度',
    finalHint: '▶ 前往第 16 關',
    next: { type: 'story', nodeId: 'ch1-016-pre' },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '奇怪……為什麼你的記憶被打碎後，還會發亮？' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '因為那不是只有我的記憶。祖父也在裡面。' },
    ],
  },
  {
    id: 'ch1-016-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '小雞的嫉妒',
    finalHint: '▶ 開始第 16 關',
    next: { type: 'battle', level: 16 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '你不是只想救祖父。你想證明他最在乎的是你。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '……就算是真的，也不代表我救他的心是假的。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '說得好。承認醜陋，比假裝純潔更有勇氣。' },
    ],
  },
  {
    id: 'ch1-017-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '勇氣回歸',
    finalHint: '▶ 開始第 17 關',
    next: { type: 'battle', level: 17 },
    lines: [
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '剛才是我錯了。我不該用沉默替你決定能不能承受。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那下次一起怕，一起打。' },
    ],
  },
  {
    id: 'ch1-018-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '記憶不是證據',
    finalHint: '▶ 開始第 18 關',
    next: { type: 'battle', level: 18 },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我看見祖父關上了塔門。但那段記憶像被剪掉一半。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '記憶是真的，不代表解讀是真的。先活過這片霧。' },
    ],
  },
  {
    id: 'ch1-019-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '幻影的空白',
    finalHint: '▶ 開始第 19 關',
    next: { type: 'battle', level: 19 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '你們都有過去，真吵。我的腦袋裡只有別人的回音。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '所以你才偷記憶？你只是想知道自己是誰。' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '閉嘴。不要用同情碰我。' },
    ],
  },
  {
    id: 'ch1-020-pre',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '被吞下的名字',
    finalHint: '▶ 開始第 20 關',
    next: { type: 'battle', level: 20 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '最後一口。把你的勇氣、嫉妒、害怕，全都交給我。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那些都是我的。難看也是我的，不准你拿走！' },
    ],
  },
  {
    id: 'ch1-020-post',
    chapterLabel: '第一章 · 幽靈之謎',
    title: '混沌的門牌',
    finalHint: '▶ 前往第 21 關',
    next: { type: 'story', nodeId: 'ch1-021-pre' },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '混沌在黑潮邊界等你。它比我誠實，也比我殘忍。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '小雞，從這裡開始，它會用真相攻擊你。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那我就帶著真相前進。' },
    ],
  },
];
