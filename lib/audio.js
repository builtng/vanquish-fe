/**
 * Audio Notification Utility
 * ──────────────────────────
 * Uses Web Audio API to synthesize a pleasant, harmonic chime.
 * Requires no external audio files and works seamlessly across browsers.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Pre-unlock audio context on user interaction
 */
export function unlockAudio() {
  getAudioContext();
}

/**
 * Play a gentle, two-tone message notification chime
 */
export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master gain for comfortable volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, now);
    masterGain.connect(ctx.destination);

    // Filter to make sound soft and warm
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.connect(masterGain);

    // Tone 1 (E5: ~659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.8, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(filter);

    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2 (A5: 880 Hz) - slightly delayed for a pleasant two-tone chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.09);

    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(1.0, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(filter);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.56);
  } catch (err) {
    // Ignore audio autoplay restrictions gracefully
    console.debug("Notification chime skipped:", err);
  }
}
