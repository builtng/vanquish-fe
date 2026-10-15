/**
 * Audio Notification Utility
 * ──────────────────────────
 * Uses Web Audio API to synthesize a pleasant, harmonic chime.
 * Requires no external audio files and works seamlessly across browsers.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    return null;
  }
  return audioCtx;
}

const MUTE_STORAGE_KEY = "vqt_message_sound_muted";

export function isAudioMuted() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch (e) {
    return false;
  }
}

export function setAudioMuted(muted) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
    window.dispatchEvent(new CustomEvent("vqt-audio-mute-changed", { detail: { muted: !!muted } }));
  } catch (e) {}
}

export function toggleAudioMuted() {
  const next = !isAudioMuted();
  setAudioMuted(next);
  return next;
}

/**
 * Pre-unlock audio context on user interaction
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Play a gentle, two-tone message notification chime
 */
export function playNotificationChime() {
  if (isAudioMuted()) {
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTones = (activeCtx) => {
      try {
        const now = activeCtx.currentTime;

        // Master gain for comfortable volume
        const masterGain = activeCtx.createGain();
        masterGain.gain.setValueAtTime(0.25, now);
        masterGain.connect(activeCtx.destination);

        // Filter to make sound soft and warm
        const filter = activeCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, now);
        filter.connect(masterGain);

        // Tone 1 (E5: ~659.25 Hz)
        const osc1 = activeCtx.createOscillator();
        const gain1 = activeCtx.createGain();
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
        const osc2 = activeCtx.createOscillator();
        const gain2 = activeCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.09);

        gain2.gain.setValueAtTime(0.001, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(1.0, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc2.connect(gain2);
        gain2.connect(filter);

        osc2.start(now + 0.09);
        osc2.stop(now + 0.56);
      } catch (innerErr) {
        console.debug("Inner tone error:", innerErr);
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(() => playTones(ctx)).catch(() => {});
    } else {
      playTones(ctx);
    }
  } catch (err) {
    // Ignore audio autoplay restrictions gracefully
    console.debug("Notification chime skipped:", err);
  }
}
