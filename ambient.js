// ambient.js — plays a random sound from /ambient at random intervals.
(() => {
  const SOUNDS = [
    'ambient/atmos2.ogg',
    'ambient/brave-sir-robin.ogg',
    'ambient/doors-tuck.ogg',
  ];
  const MIN_GAP = 20;   // seconds between sounds (shortest)
  const MAX_GAP = 60;   // seconds between sounds (longest)
  const VOLUME  = 0.5;  // 0.0 to 1.0

  let muted = localStorage.getItem('ambientMuted') === '1';
  let last = -1;
  let timer = null;
  let started = false;
  const audio = new Audio();
  audio.volume = VOLUME;

  function pick() {
    let i;
    do { i = Math.floor(Math.random() * SOUNDS.length); }
    while (SOUNDS.length > 1 && i === last);  // no repeats back to back
    last = i;
    return SOUNDS[i];
  }

  function schedule() {
    clearTimeout(timer);
    const delay = (MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP)) * 1000;
    timer = setTimeout(play, delay);
  }

    function play() {
    if (muted) { schedule(); return; }
    audio.src = pick();
    audio.play().catch(schedule);  // if playback fails, just try again later
  }

  // Start the random wait only after a sound has finished
  audio.addEventListener('ended', schedule);

  // Browsers block sound until the visitor interacts with the page,
  // so the timer starts on the first click, tap, or key press.
  function start() {
    if (started) return;
    started = true;
    schedule();
  }
  ['pointerdown', 'keydown'].forEach(e =>
    window.addEventListener(e, start, { once: true }));

  // Small sound toggle in the bottom-right corner
  const btn = document.createElement('button');
  btn.className = 'ambient-toggle';
  const label = () => btn.textContent = muted ? 'sound: off' : 'sound: on';
  label();
  btn.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('ambientMuted', muted ? '1' : '0');
    if (muted) audio.pause();
    label();
  });
  document.body.appendChild(btn);
})();
