const moods = {
  calm: {
    label: 'Calm waves',
    emoji: '🌊',
    copy: 'Soft, floating notes for a peaceful, focused break.',
    notes: [261.63, 329.63, 392.0, 440.0],
    interval: 780,
    type: 'sine',
    gain: 0.025,
  },
  happy: {
    label: 'Happy spark',
    emoji: '☀️',
    copy: 'Bright chords and a cheerful beat to lift your mood.',
    notes: [329.63, 392.0, 523.25, 659.25],
    interval: 520,
    type: 'triangle',
    gain: 0.03,
  },
  focus: {
    label: 'Focus mode',
    emoji: '🧠',
    copy: 'Clean, steady pulses to help your mind stay in flow.',
    notes: [196.0, 261.63, 329.63, 392.0],
    interval: 420,
    type: 'sawtooth',
    gain: 0.028,
  },
  dreamy: {
    label: 'Dreamy glow',
    emoji: '✨',
    copy: 'A gentle synth wash for soft, cinematic relaxation.',
    notes: [174.61, 220.0, 277.18, 349.23],
    interval: 900,
    type: 'sine',
    gain: 0.018,
  },
};

const moodCards = document.querySelectorAll('.mood-card');
const moodLabel = document.getElementById('mood-label');
const moodEmoji = document.getElementById('mood-emoji');
const moodCopy = document.getElementById('mood-copy');
const playToggle = document.getElementById('play-toggle');
const stopBtn = document.getElementById('stop-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');

let audioContext = null;
let masterGain = null;
let currentInterval = null;
let currentMood = 'calm';
let isPlaying = false;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    masterGain = audioContext.createGain();
    const initialVolume = Number(volumeSlider.value || 60) / 100;
    masterGain.gain.value = Math.max(0.01, initialVolume * 0.12);
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(freq, duration, type, gainLevel) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.linearRampToValueAtTime(freq * 1.01, now + duration * 0.7);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(gainLevel, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration);
}

function stopMusic() {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  isPlaying = false;
  playToggle.textContent = 'Play mood';
}

function updateVolume(value) {
  const volume = Number(value) / 100;
  if (masterGain) {
    masterGain.gain.value = Math.max(0.01, volume * 0.12);
  }
  volumeValue.textContent = `${value}%`;
}

function updateMoodUI(moodName) {
  const selection = moods[moodName];
  moodLabel.textContent = selection.label;
  moodEmoji.textContent = selection.emoji;
  moodCopy.textContent = selection.copy;
  playToggle.textContent = isPlaying ? 'Playing…' : 'Play mood';

  moodCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.mood === moodName);
  });
}

function startMood(moodName) {
  const selection = moods[moodName];
  if (!selection) return;

  currentMood = moodName;
  stopMusic();

  getAudioContext();
  isPlaying = true;
  updateMoodUI(moodName);

  let step = 0;
  currentInterval = setInterval(() => {
    const freq = selection.notes[step % selection.notes.length];
    playTone(freq, 0.38, selection.type, selection.gain);

    const bass = freq * 0.5;
    playTone(bass, 0.24, 'sawtooth', selection.gain * 0.65);

    step += 1;
  }, selection.interval);

  playToggle.textContent = 'Playing…';
}

moodCards.forEach((card) => {
  card.addEventListener('click', () => {
    startMood(card.dataset.mood);
  });
});

playToggle.addEventListener('click', () => {
  if (isPlaying && currentMood) {
    stopMusic();
    updateMoodUI(currentMood);
    return;
  }

  startMood(currentMood);
});

stopBtn.addEventListener('click', () => {
  stopMusic();
  updateMoodUI(currentMood);
});

volumeSlider.addEventListener('input', (event) => {
  updateVolume(event.target.value);
});

updateVolume(volumeSlider.value);
updateMoodUI(currentMood);
startMood(currentMood);
