// ambient.js: random sounds with real silence between them. 
(() => {
  const SOUNDS = [
    'ambient/atmos2.ogg',
    'ambient/brave-sir-robin.ogg',
    'ambient/doors-tuck.ogg',
  ];
  const MIN_GAP = 100;   // seconds of SILENCE after a sound finishes (shortest)
  const MAX_GAP = 200;   // seconds of SILENCE after a sound finishes (longest)
  const VOLUME  = 0.5;

  let muted = localStorage.getItem('ambientMuted') === '1';
  let last = -1;
  let timer = null;
  let started = false;

  const audio = new Audio();
  audio.volume = VOLUME;

  function pick() {
    let i;
    do { i = Math.floor(Math.random() * SOUNDS.length); }
    while (SOUNDS.length > 1 && i === last);
    last = i;
    return SOUNDS[i];
  }

  // The ONLY place a countdown starts. It is never called while a sound plays.
  function scheduleNext() {
    clearTimeout(timer);
    const delay = (MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP)) * 1000;
    timer = setTimeout(playNow, delay);
  }

  function playNow() {
    if (muted || !audio.paused) { scheduleNext(); return; }
    audio.src = pick();
    audio.play().catch(scheduleNext);
  }

  // The silence begins when a sound ends (or fails to load).
  audio.addEventListener('ended', scheduleNext);
  audio.addEventListener('error', scheduleNext);

  function start() {
    if (started) return;
    started = true;
    scheduleNext();
  }
  ['pointerdown', 'keydown'].forEach(e =>
    window.addEventListener(e, start, { once: true }));

  const btn = document.createElement('button');
  btn.className = 'ambient-toggle';
  const label = () => btn.textContent = muted ? 'sound: off' : 'sound: on';
  label();
  btn.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('ambientMuted', muted ? '1' : '0');
    if (muted) { audio.pause(); if (started) scheduleNext(); }
    label();
  });
  document.body.appendChild(btn);
})();
