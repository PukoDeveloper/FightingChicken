import type { StoryNode } from '../types';

export const STORY_NODES: StoryNode[] = [
  {
    id: 'prologue',
    chapterLabel: '序章',
    title: '小雞的覺醒',
    finalHint: '▶ 前往星野',
    next: { type: 'story', nodeId: 'ch1-001-pre' },
    lines: [
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '今天，是我離開家的第一天。星空好大，大到連害怕都像會被吹走。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '祖父火雞……你究竟在宇宙的哪個角落等著我？' },
      { speaker: '祖父火雞', portrait: 'grandpa', accentColor: 0xffcc55, side: 'right', text: '孩子……真正的勇氣不是無懼，而是即使害怕，也要繼續向前。' },
      { speaker: '小雞', portrait: 'chicken', accentColor: 0x66aaff, side: 'left', text: '我會找到你。就算我很害怕，我也會向前。' },
    ],
  },
];
