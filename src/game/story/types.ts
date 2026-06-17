export type StoryPortraitId =
  | 'chicken'
  | 'grandpa'
  | 'courage'
  | 'phantom'
  | 'chaos'
  | 'mech'
  | 'storm'
  | 'dragon'
  | 'void';

export interface StoryDialogueLine {
  speaker: string;
  portrait: StoryPortraitId;
  accentColor: number;
  text: string;
  side: 'left' | 'right';
}

export type StoryNextAction =
  | { type: 'battle'; level: number }
  | { type: 'story'; nodeId: string }
  | { type: 'menu' };

export interface StoryNode {
  id: string;
  chapterLabel: string;
  title: string;
  lines: StoryDialogueLine[];
  next: StoryNextAction;
  finalHint?: string;
}

export interface StoryMenuEntry {
  number: string;
  title: string;
  subtitle: string;
  nodeId: string;
}
