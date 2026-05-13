export function spawnPetal(x: number, y: number): void {
  const stage = document.getElementById('sakura-stage');
  if (!stage) return;
  const p = document.createElement('div');
  p.className = 'petal';
  const dx = (Math.random() - 0.5) * 220;
  const size = 8 + Math.random() * 8;
  const hueShift = Math.random() * 12 - 6;
  p.style.left = `${x + (Math.random() - 0.5) * 20}px`;
  p.style.top = `${y}px`;
  p.style.width = `${size}px`;
  p.style.height = `${size * 0.85}px`;
  p.style.setProperty('--dx', `${dx}px`);
  p.style.background = `hsl(${10 + hueShift}, 62%, ${48 + Math.random() * 8}%)`;
  p.style.animationDuration = `${3.6 + Math.random() * 1.6}s`;
  stage.appendChild(p);
  setTimeout(() => p.remove(), 5500);
}

export function petalBurst(el: Element | null, n = 6): void {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnPetal(cx, cy), i * 50);
  }
}
