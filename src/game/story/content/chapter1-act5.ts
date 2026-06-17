import type { StoryNode } from '../types';

export const STORY_NODES: StoryNode[] = [
  {
    id: 'ch1-041-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '暴風信使',
    finalHint: '▶ 開始第 41 關',
    next: { type: 'battle', level: 41 },
    lines: [
      { speaker: '暴風魔', portrait: 'storm', accentColor: 0xee66ff, side: 'right', text: '訊息、訊息、訊息——不能停，停下就會聽見沒送到的那一句！' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '它是以前的塔內信使。裂隙把它磨成風暴了。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那我們就讓風停一下。' },
    ],
  },
  {
    id: 'ch1-042-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '停不下來的風',
    finalHint: '▶ 開始第 42 關',
    next: { type: 'battle', level: 42 },
    lines: [
      { speaker: '暴風魔', portrait: 'storm', accentColor: 0xee66ff, side: 'right', text: '我停下那天，警告沒有送到。塔亮了，朋友不見了。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '所以你一直跑，是怕聽見自己失敗。' },
    ],
  },
  {
    id: 'ch1-043-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '被送丟的訊息',
    finalHint: '▶ 開始第 43 關',
    next: { type: 'battle', level: 43 },
    lines: [
      { speaker: '暴風魔', portrait: 'storm', accentColor: 0xee66ff, side: 'right', text: '訊息內容：不要用記憶補封印。不要。不要。不要——' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '如果那訊息送到，也許很多事不會發生。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '現在送到我這裡了。還不算太晚。' },
    ],
  },
  {
    id: 'ch1-044-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '小雞學會等待',
    finalHint: '▶ 開始第 44 關',
    next: { type: 'battle', level: 44 },
    lines: [
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '別追它的速度。等風眼露出來。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '以前我一定會衝上去。現在……我等。' },
    ],
  },
  {
    id: 'ch1-045-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '風暴之眼',
    finalHint: '▶ 開始第 45 關',
    next: { type: 'battle', level: 45 },
    lines: [
      { speaker: '暴風魔', portrait: 'storm', accentColor: 0xee66ff, side: 'right', text: '如果你能穿過風眼，我就把裂隙座標給你。不要讓訊息再丟一次。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '這次，我會送到。' },
    ],
  },
  {
    id: 'ch1-045-post',
    chapterLabel: '第一章 · 虛空門扉',
    title: '裂隙座標',
    finalHint: '▶ 前往第 46 關',
    next: { type: 'story', nodeId: 'ch1-046-pre' },
    lines: [
      { speaker: '暴風魔', portrait: 'storm', accentColor: 0xee66ff, side: 'right', text: '座標給你。門前還有龍。它不是敵人，可它比敵人更難通過。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '不是敵人，卻會阻止我？' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '有些守護者，寧願被恨，也不願讓門打開。' },
    ],
  },
  {
    id: 'ch1-046-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '龍王門前',
    finalHint: '▶ 開始第 46 關',
    next: { type: 'battle', level: 46 },
    lines: [
      { speaker: '龍王', portrait: 'dragon', accentColor: 0xff6633, side: 'right', text: '星火持有者，止步。門後不是你能補救的錯。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '祖父就在門旁。我必須進去。' },
      { speaker: '龍王', portrait: 'dragon', accentColor: 0xff6633, side: 'right', text: '為一人冒整片星空之險，這不是勇氣，是傲慢。' },
    ],
  },
  {
    id: 'ch1-047-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '大局與一人',
    finalHint: '▶ 開始第 47 關',
    next: { type: 'battle', level: 47 },
    lines: [
      { speaker: '龍王', portrait: 'dragon', accentColor: 0xff6633, side: 'right', text: '若你祖父已被虛空污染，你能親手關上門嗎？' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我不知道。但我不會在看見他之前就替他判死。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '回答不漂亮，但是真的。' },
    ],
  },
  {
    id: 'ch1-048-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '幻影的選擇',
    finalHint: '▶ 開始第 48 關',
    next: { type: 'battle', level: 48 },
    lines: [
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '我找到一段記憶。你祖父在門邊還叫得出你的名字。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '你沒有吞掉它？' },
      { speaker: '幻影', portrait: 'phantom', accentColor: 0x88aaff, side: 'right', text: '我只是……想知道保留一段記憶是什麼感覺。' },
    ],
  },
  {
    id: 'ch1-049-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '龍王之戰',
    finalHint: '▶ 開始第 49 關',
    next: { type: 'battle', level: 49 },
    lines: [
      { speaker: '龍王', portrait: 'dragon', accentColor: 0xff6633, side: 'right', text: '最後試煉。若你的星火只是執念，它會在龍焰中熄滅。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '如果它是勇氣，就會照亮門後的路。' },
    ],
  },
  {
    id: 'ch1-050-pre',
    chapterLabel: '第一章 · 虛空門扉',
    title: '虛空門扉',
    finalHint: '▶ 開始第 50 關',
    next: { type: 'battle', level: 50 },
    lines: [
      { speaker: '祖父火雞', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '孫兒……你真的來了。對不起，我把太多事藏在「為你好」裡。' },
      { speaker: '虛空核心', portrait: 'void', accentColor: 0xddaaff, side: 'right', text: '星火。恐懼。家。門已看見你。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我來救祖父，也來面對你。這一次，我不逃。' },
    ],
  },
  {
    id: 'ch1-050-post',
    chapterLabel: '第一章 · 星火與勇氣',
    title: '門後的黎明',
    finalHint: '▶ 回到故事選單',
    next: { type: 'menu' },
    lines: [
      { speaker: '祖父火雞', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '你救了我，也喚醒了門。接下來的路，不該再由我替你決定。' },
      { speaker: '勇氣', portrait: 'courage', accentColor: 0xff6644, side: 'right', text: '第一章結束了，小雞。真正麻煩的星路，才剛開始。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '那就一起走。害怕也一起，勇敢也一起。' },
    ],
  },
];
