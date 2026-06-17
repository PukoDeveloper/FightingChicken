import type { StoryNode } from './types';

type StoryChunkModule = { STORY_NODES: StoryNode[] };
type StoryChunkLoader = () => Promise<StoryChunkModule>;

const CHUNK_LOADERS: Record<string, StoryChunkLoader> = {
  prologue: () => import('./content/prologue'),
  act1: () => import('./content/chapter1-act1'),
  act2: () => import('./content/chapter1-act2'),
  act3: () => import('./content/chapter1-act3'),
  act4: () => import('./content/chapter1-act4'),
  act5: () => import('./content/chapter1-act5'),
};

const nodeCache = new Map<string, StoryNode>();
const loadedChunks = new Set<string>();

function chunkForNode(nodeId: string): keyof typeof CHUNK_LOADERS {
  if (nodeId === 'prologue') return 'prologue';

  const match = /^ch1-(\d{3})-/.exec(nodeId);
  const level = match ? Number(match[1]) : 1;
  if (level <= 10) return 'act1';
  if (level <= 20) return 'act2';
  if (level <= 30) return 'act3';
  if (level <= 40) return 'act4';
  return 'act5';
}

async function ensureChunkLoaded(chunkId: keyof typeof CHUNK_LOADERS): Promise<void> {
  if (loadedChunks.has(chunkId)) return;

  const mod = await CHUNK_LOADERS[chunkId]();
  for (const node of mod.STORY_NODES) {
    nodeCache.set(node.id, node);
  }
  loadedChunks.add(chunkId);
}

export async function loadStoryNode(nodeId: string): Promise<StoryNode> {
  const chunkId = chunkForNode(nodeId);
  await ensureChunkLoaded(chunkId);

  const node = nodeCache.get(nodeId);
  if (!node) {
    throw new Error(`Story node not found: ${nodeId}`);
  }
  return node;
}
