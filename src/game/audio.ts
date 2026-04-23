/**
 * Procedural SFX + BGM synthesizer using the Web Audio API.
 * No external audio assets are required — all sounds are generated at runtime.
 *
 * The AudioContext is created lazily on the first call so that the browser's
 * autoplay policy is respected (audio can only start after a user gesture).
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

// ─── Synthesis primitives ─────────────────────────────────────────────────────

/**
 * Play a pitched oscillator with frequency envelope.
 *
 * @param freq       Start frequency in Hz.
 * @param endFreq    End frequency in Hz (or null to hold steady).
 * @param duration   Duration in seconds.
 * @param gain       Peak gain (0–1).
 * @param type       Oscillator waveform.
 * @param startDelay Seconds from now before the note starts.
 */
function tone(
  freq: number,
  endFreq: number | null,
  duration: number,
  gain: number,
  type: OscillatorType = 'square',
  startDelay = 0,
): void {
  const ctx = getCtx();
  const t = ctx.currentTime + startDelay;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 10), t + duration);
  }

  gainNode.gain.setValueAtTime(gain, t);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

/**
 * Play a filtered noise burst (for percussive impact sounds).
 *
 * @param duration   Duration in seconds.
 * @param gain       Peak gain (0–1).
 * @param startDelay Seconds from now before the burst starts.
 * @param cutoff     Initial lowpass filter cutoff frequency in Hz.
 */
function noiseBurst(
  duration: number,
  gain: number,
  startDelay = 0,
  cutoff = 1200,
): void {
  const ctx = getCtx();
  const t = ctx.currentTime + startDelay;

  const sampleCount = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, t);
  filter.frequency.exponentialRampToValueAtTime(80, t + duration);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain, t);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  src.start(t);
  src.stop(t + duration + 0.01);
}

// ─── Sound effects ────────────────────────────────────────────────────────────

/** Player fires a bullet. */
export function sfxShoot(): void {
  tone(1000, 500, 0.055, 0.035, 'square');
}

/** Player bullet hits the enemy. */
export function sfxEnemyHit(): void {
  noiseBurst(0.07, 0.12, 0, 2400);
  tone(220, 110, 0.07, 0.05, 'sawtooth');
}

/** Enemy bullet hits the player. */
export function sfxPlayerHit(): void {
  noiseBurst(0.28, 0.38, 0, 700);
  tone(130, 65, 0.28, 0.14, 'sawtooth');
}

/** Shockwave ring expands and hits player. */
export function sfxShockwave(): void {
  tone(90, 45, 0.38, 0.20, 'sawtooth');
  noiseBurst(0.22, 0.14, 0, 320);
}

/** Trap bubble hits player. */
export function sfxBubble(): void {
  tone(1100, 380, 0.22, 0.06, 'sine');
}

/** Pickup item collected (health or power). */
export function sfxPickup(): void {
  tone(440, null, 0.07, 0.07, 'sine');
  tone(880, null, 0.1,  0.07, 'sine', 0.07);
}

/** Phase transition (enemy enters phase 2 or 3). */
export function sfxPhaseChange(): void {
  tone(330, 660, 0.28, 0.08, 'square');
  tone(660, null, 0.28, 0.05, 'sine', 0.1);
}

/** Wave cleared in level mode. */
export function sfxWaveClear(): void {
  tone(392.00, null, 0.10, 0.10, 'square');
  tone(523.25, null, 0.10, 0.10, 'square', 0.12);
  tone(659.25, null, 0.26, 0.12, 'square', 0.24);
}

/** Level / endless wave victory. */
export function sfxVictory(): void {
  tone(261.63, null, 0.10, 0.10, 'square');
  tone(329.63, null, 0.10, 0.10, 'square', 0.12);
  tone(392.00, null, 0.10, 0.10, 'square', 0.24);
  tone(523.25, null, 0.10, 0.10, 'square', 0.36);
  tone(659.25, null, 0.40, 0.14, 'square', 0.48);
}

/** Player is defeated. */
export function sfxDefeat(): void {
  tone(392.00, null, 0.15, 0.10, 'sawtooth');
  tone(329.63, null, 0.15, 0.10, 'sawtooth', 0.18);
  tone(261.63, null, 0.42, 0.12, 'sawtooth', 0.36);
}

/** Enemy dies / explodes. */
export function sfxEnemyDeath(): void {
  noiseBurst(0.52, 0.45, 0, 3000);
  tone(200, 50,  0.52, 0.16, 'sawtooth');
  tone(400, 100, 0.52, 0.10, 'square');
}

/** Short UI click / menu button press. */
export function sfxMenuClick(): void {
  tone(800, 600, 0.045, 0.045, 'square');
}

// ─── Background music ─────────────────────────────────────────────────────────
// A looping chiptune arpeggio in Pentatonic Minor (C Eb F G Bb).

/** Pentatonic Minor rooted at C4, spanning two octaves. */
const BGM_SCALE = [
  261.63, // C4
  311.13, // Eb4
  349.23, // F4
  392.00, // G4
  466.16, // Bb4
  523.25, // C5
  622.25, // Eb5
  698.46, // F5
];

/**
 * 32-step arpeggio pattern (indices into BGM_SCALE, −1 = rest).
 * Two bars of 16 sixteenth-notes each at BPM 148.
 */
const BGM_PATTERN: number[] = [
  0, 2, 4, 2,  4, 2, 0, -1,  1, 3, 5, 3,  5, 3, 1, -1,
  0, 2, 4, 6,  4, 6, 5, -1,  0, 1, 2, 3,  4, 3, 2, -1,
];

const BGM_BPM = 148;
/** Duration of one sixteenth-note in milliseconds (≈ 101.35 ms at BPM 148). */
const BGM_STEP_MS = (60_000 / BGM_BPM) / 4; // ≈ 101 ms

let _bgmTimer = 0;
let _bgmStep = 0;
let _bgmRunning = false;

function _bgmTick(): void {
  if (!_bgmRunning) return;

  const noteIdx = BGM_PATTERN[_bgmStep % BGM_PATTERN.length];
  if (noteIdx >= 0) {
    // Lead arpeggio
    tone(BGM_SCALE[noteIdx], null, (BGM_STEP_MS * 0.65) / 1000, 0.18, 'square');
    // Bass on every 8 steps (beat 1 and 3 of each bar)
    if (_bgmStep % 8 === 0) {
      tone(BGM_SCALE[0] / 2, null, (BGM_STEP_MS * 1.8) / 1000, 0.22, 'sawtooth');
    }
    // Off-beat chord accent on steps 4 and 12 of each bar
    if (_bgmStep % 16 === 4 || _bgmStep % 16 === 12) {
      tone(BGM_SCALE[2], null, (BGM_STEP_MS * 0.5) / 1000, 0.10, 'square');
      tone(BGM_SCALE[4], null, (BGM_STEP_MS * 0.5) / 1000, 0.08, 'sine');
    }
  }

  _bgmStep++;
  _bgmTimer = window.setTimeout(_bgmTick, BGM_STEP_MS);
}

/** Start the background music loop. No-op if already playing. */
export function startBgm(): void {
  if (_bgmRunning) return;
  _bgmRunning = true;
  _bgmStep = 0;
  _bgmTick();
}

/** Stop the background music loop. */
export function stopBgm(): void {
  _bgmRunning = false;
  clearTimeout(_bgmTimer);
}
