import { useEffect } from 'react';

export function useAuroraCanvas(canvasRef, isDark, { density = 6500, maxAlpha = 0.78 } = {}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, t = 0;
    const mouse = { x: -9999, y: -9999 };
    let particles = [];

    const litRange  = isDark ? [55, 76] : [22, 45];
    const satRange  = isDark ? [70, 92] : [78, 98];
    const aRange    = isDark ? [0.28, 0.52] : [0.30, 0.55];
    const HUE_PALETTE = isDark
      ? [38, 42, 46, 50, 54, 44, 48]
      : [240, 258, 275, 295, 312, 195, 210];

    const makeParticles = (W, H) => {
      const count = Math.min(Math.floor((W * H) / density), 100);
      particles = Array.from({ length: count }, () => {
        const hue = HUE_PALETTE[Math.floor(Math.random() * HUE_PALETTE.length)] + (Math.random() - 0.5) * 18;
        const p = {
          bx: Math.random() * W, by: Math.random() * H,
          x: 0, y: 0,
          vx: (Math.random() - 0.5) * 0.30, vy: (Math.random() - 0.5) * 0.30,
          size: Math.random() * 2.0 + 0.6, hue,
          sat: Math.random() * (satRange[1] - satRange[0]) + satRange[0],
          lit: Math.random() * (litRange[1] - litRange[0]) + litRange[0],
          alpha: Math.min(maxAlpha, Math.random() * (aRange[1] - aRange[0]) + aRange[0]),
          phase: Math.random() * Math.PI * 2, orbitR: Math.random() * 22 + 8, spd: Math.random() * 0.009 + 0.004,
        };
        p.x = p.bx; p.y = p.by; return p;
      });
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H); t++;
      const rect = canvas.getBoundingClientRect();
      const lx = mouse.x - rect.left, ly = mouse.y - rect.top;

      particles.forEach(p => {
        p.x = p.bx + Math.cos(p.phase + t * p.spd) * p.orbitR;
        p.y = p.by + Math.sin(p.phase * 1.37 + t * p.spd * 0.78) * p.orbitR * 0.52;
        p.bx += p.vx; p.by += p.vy;
        if (p.bx < -70) p.bx = W + 70; if (p.bx > W + 70) p.bx = -70;
        if (p.by < -70) p.by = H + 70; if (p.by > H + 70) p.by = -70;
        const mdx = lx - p.x, mdy = ly - p.y, md2 = mdx * mdx + mdy * mdy;
        if (md2 < 12000) {
          const md = Math.sqrt(md2) || 1, f = (12000 - md2) / 12000 * 3.8;
          p.bx -= (mdx / md) * f; p.by -= (mdy / md) * f;
        }
      });

      const CONN = 120, lineAlpha = 0.18;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN) {
            const a = (1 - d / CONN) * lineAlpha;
            const hMid = (particles[i].hue + particles[j].hue) / 2;
            ctx.strokeStyle = `hsla(${hMid},80%,${isDark ? 68 : 38}%,${a.toFixed(3)})`;
            ctx.lineWidth = 0.65; ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }

      particles.forEach(({ x, y, size, hue, sat, lit, alpha }) => {
        const base = `hsla(${hue},${sat}%,${lit}%,`;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
        grd.addColorStop(0, `${base}${(alpha * 0.65).toFixed(3)})`);
        grd.addColorStop(0.5, `${base}${(alpha * 0.18).toFixed(3)})`);
        grd.addColorStop(1, `${base}0)`);
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, size * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `${base}${Math.min(1, alpha + 0.40).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.round(width); canvas.height = Math.round(height);
          makeParticles(canvas.width, canvas.height);
        }
      }
    });
    ro.observe(canvas); draw();

    return () => { cancelAnimationFrame(animId); ro.disconnect(); window.removeEventListener('mousemove', onMove); };
  }, [canvasRef, isDark, density, maxAlpha]);
}
