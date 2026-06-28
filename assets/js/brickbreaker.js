/* =========================================================================
   Brick Breaker — a small vanilla-JS canvas game that opens in a popup.
   This is a lightweight in-browser mini-version for fun; the real project
   is the Java 17 / JavaFX app linked from the card's "Source" button.

   Exposes: window.BrickGame.open()
   No dependencies. Safe to delete this file (and the project's `play` flag
   in config.js) if you don't want it.
   ========================================================================= */
window.BrickGame = (function () {
  'use strict';

  const W = 480, H = 360;
  let overlay = null, cleanup = null;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function open() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'game-modal';
    overlay.innerHTML = `
      <div class="game-modal__backdrop" data-gclose></div>
      <div class="game-win" role="dialog" aria-modal="true" aria-label="Brick Breaker mini-game">
        <div class="game-win__bar">
          <span class="game-win__dot"></span><span class="game-win__dot"></span><span class="game-win__dot"></span>
          <span class="game-win__title">brick-breaker · mini</span>
          <button class="game-win__close" data-gclose aria-label="Close game">✕</button>
        </div>
        <div class="game-stage">
          <canvas class="game-canvas"></canvas>
          <div class="game-overlay-msg" data-msg></div>
        </div>
        <div class="game-foot">
          <span data-score>Score 0</span>
          <span data-lives>♥♥♥</span>
          <span class="game-hint">drag / ← → · tap or Space to launch</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.querySelectorAll('[data-gclose]').forEach(el => el.addEventListener('click', close));
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    const stopGame = start(overlay.querySelector('.game-canvas'), overlay);
    cleanup = () => { stopGame(); document.removeEventListener('keydown', onEsc); };
  }

  function close() {
    if (!overlay) return;
    if (cleanup) cleanup();
    overlay.remove();
    overlay = null; cleanup = null;
    document.body.style.overflow = '';
  }

  function start(canvas, root) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const cs = getComputedStyle(document.documentElement);
    const col = (n, f) => (cs.getPropertyValue(n).trim() || f);
    const ACC = [col('--accent', '#22d3ee'), col('--accent-2', '#818cf8'), col('--accent-3', '#c084fc')];
    const INK = col('--text', '#e8edf7');

    const paddle = { w: 74, h: 11, x: W / 2 - 37, y: H - 26, speed: 4 };
    const ball = { r: 7, x: W / 2, y: paddle.y - 8, vx: 0, vy: 0, sp: 3 };
    let state = 'ready', score = 0, lives = 3, raf = 0;
    const keys = { left: false, right: false };

    const cols = 7, rows = 5, gap = 6, mTop = 42, mSide = 22, bh = 16;
    const bw = (W - 2 * mSide - (cols - 1) * gap) / cols;
    let bricks = [];
    function buildBricks() {
      bricks = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          bricks.push({ x: mSide + c * (bw + gap), y: mTop + r * (bh + gap), w: bw, h: bh, alive: true, color: ACC[r % ACC.length] });
    }
    buildBricks();

    function resetBall() { state = 'ready'; ball.x = paddle.x + paddle.w / 2; ball.y = paddle.y - ball.r - 1; ball.vx = 0; ball.vy = 0; }
    function launch() {
      if (state !== 'ready') return;
      const a = Math.random() * 0.6 - 0.3;
      ball.vx = ball.sp * Math.sin(a) || 1.6;
      ball.vy = -ball.sp * Math.cos(a);
      state = 'playing';
    }
    function restart() { score = 0; lives = 3; buildBricks(); resetBall(); }
    function action() { if (state === 'ready') launch(); else if (state === 'won' || state === 'over') restart(); }

    /* ---- input ---- */
    function onKey(e, down) {
      if (e.key === 'ArrowLeft') { keys.left = down; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { keys.right = down; e.preventDefault(); }
      else if (down && (e.key === ' ' || e.key === 'Spacebar')) { e.preventDefault(); action(); }
    }
    const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    function pointerX(clientX) {
      const rect = canvas.getBoundingClientRect();
      return (clientX - rect.left) / rect.width * W;
    }
    function movePaddle(clientX) {
      paddle.x = Math.max(0, Math.min(W - paddle.w, pointerX(clientX) - paddle.w / 2));
      if (state === 'ready') ball.x = paddle.x + paddle.w / 2;
    }
    const onMove = (e) => movePaddle(e.clientX);
    const onClick = () => action();
    const onTouchStart = (e) => { action(); if (e.touches[0]) movePaddle(e.touches[0].clientX); e.preventDefault(); };
    const onTouchMove = (e) => { if (e.touches[0]) movePaddle(e.touches[0].clientX); e.preventDefault(); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    const scoreEl = root.querySelector('[data-score]');
    const livesEl = root.querySelector('[data-lives]');
    const msgEl = root.querySelector('[data-msg]');

    /* ---- update ---- */
    function update() {
      if (keys.left) paddle.x = Math.max(0, paddle.x - paddle.speed);
      if (keys.right) paddle.x = Math.min(W - paddle.w, paddle.x + paddle.speed);
      if (state === 'ready') { ball.x = paddle.x + paddle.w / 2; return; }
      if (state !== 'playing') return;

      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -1; }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx *= -1; }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -1; }

      // paddle bounce (angle depends on where it hits)
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h + 8 &&
          ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const ang = hit * 1.05;
        ball.vx = ball.sp * Math.sin(ang);
        ball.vy = -Math.abs(ball.sp * Math.cos(ang));
        ball.y = paddle.y - ball.r - 1;
      }

      // brick collisions
      for (const b of bricks) {
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.alive = false; score += 10;
          const ox = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
          const oy = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
          if (ox < oy) ball.vx *= -1; else ball.vy *= -1;
          break;
        }
      }

      if (ball.y - ball.r > H) { lives -= 1; if (lives <= 0) state = 'over'; else resetBall(); }
      if (bricks.every(b => !b.alive)) state = 'won';
    }

    /* ---- draw ---- */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const b of bricks) { if (!b.alive) continue; ctx.fillStyle = b.color; roundRect(ctx, b.x, b.y, b.w, b.h, 3); ctx.fill(); }
      ctx.fillStyle = INK; roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 5); ctx.fill();
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = ACC[0]; ctx.fill();

      scoreEl.textContent = 'Score ' + score;
      livesEl.textContent = lives > 0 ? '♥'.repeat(lives) : '—';
      if (state === 'ready') msg('Tap or press Space to launch');
      else if (state === 'won') msg('You cleared it! 🎉  Tap to play again');
      else if (state === 'over') msg('Game over · Tap to play again');
      else msg('');
    }
    function msg(t) { if (!t) { msgEl.style.display = 'none'; } else { msgEl.textContent = t; msgEl.style.display = 'grid'; } }

    function loop() { update(); draw(); raf = requestAnimationFrame(loop); }
    loop();

    return function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }

  return { open };
})();
