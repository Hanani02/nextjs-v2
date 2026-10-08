import * as THREE from 'three';

/**
 * Procedural canvas texture generators for the 3D Isometric Developer Room.
 * Generates crisp, lightweight, zero-network textures for screens, art, and floor.
 */

export function createEditorTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = '#161424';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top window header
  ctx.fillStyle = '#110f1c';
  ctx.fillRect(0, 0, canvas.width, 36);

  // Window dots
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(20, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(38, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(56, 18, 6, 0, Math.PI * 2);
  ctx.fill();

  // Active Tab
  ctx.fillStyle = '#1e1a32';
  ctx.fillRect(80, 6, 180, 30);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('⚡ DeveloperRoom.tsx', 96, 26);

  // Left sidebar
  ctx.fillStyle = '#12101e';
  ctx.fillRect(0, 36, 160, canvas.height - 36);
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.fillText('EXPLORER', 16, 62);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('▾ src', 16, 88);
  ctx.fillText('  ▸ components', 22, 110);
  ctx.fillText('  ▸ projects', 22, 132);
  ctx.fillText('  ▸ experience', 22, 154);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('  ★ DeveloperRoom.tsx', 22, 178);

  // Code editor lines
  const startX = 180;
  let startY = 70;
  const lineH = 24;

  const lines = [
    { num: '1', tokens: [{ text: 'import ', color: '#c084fc' }, { text: '{ usePortfolio } ', color: '#38bdf8' }, { text: 'from ', color: '#c084fc' }, { text: '"@/hooks"', color: '#34d399' }] },
    { num: '2', tokens: [{ text: 'import ', color: '#c084fc' }, { text: '{ FullstackDeveloper } ', color: '#38bdf8' }, { text: 'from ', color: '#c084fc' }, { text: '"@/hanan"', color: '#34d399' }] },
    { num: '3', tokens: [] },
    { num: '4', tokens: [{ text: 'export default function ', color: '#c084fc' }, { text: 'HeroWorkspace', color: '#facc15' }, { text: '() {', color: '#e2e8f0' }] },
    { num: '5', tokens: [{ text: '  const ', color: '#c084fc' }, { text: 'skills = ', color: '#e2e8f0' }, { text: '["Next.js", "TypeScript", "React", "Supabase", "Three.js"]', color: '#fb923c' }] },
    { num: '6', tokens: [{ text: '  const ', color: '#c084fc' }, { text: 'mission = ', color: '#e2e8f0' }, { text: '"Crafting clean, high-performance web experiences"', color: '#34d399' }] },
    { num: '7', tokens: [] },
    { num: '8', tokens: [{ text: '  return (', color: '#c084fc' }] },
    { num: '9', tokens: [{ text: '    <DeveloperRoom ', color: '#38bdf8' }, { text: 'status=', color: '#93c5fd' }, { text: '"Building Future"', color: '#34d399' }] },
    { num: '10', tokens: [{ text: '      focus=', color: '#93c5fd' }, { text: '"Fullstack & Creative UI"', color: '#fb923c' }] },
    { num: '11', tokens: [{ text: '      projects=', color: '#93c5fd' }, { text: '{activeProjects}', color: '#38bdf8' }] },
    { num: '12', tokens: [{ text: '    />', color: '#38bdf8' }] },
    { num: '13', tokens: [{ text: '  );', color: '#c084fc' }] },
    { num: '14', tokens: [{ text: '}', color: '#e2e8f0' }] }
  ];

  lines.forEach((l) => {
    // Line number
    ctx.fillStyle = '#475569';
    ctx.font = '13px monospace';
    ctx.fillText(l.num.padStart(2, ' '), startX, startY);

    // Code tokens
    let curX = startX + 35;
    l.tokens.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, curX, startY);
      curX += ctx.measureText(t.text).width;
    });

    startY += lineH;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export function createTerminalTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title bar
  ctx.fillStyle = '#101420';
  ctx.fillRect(0, 0, canvas.width, 32);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('bash - hanani@desktop:~', 16, 21);

  // Terminal logs
  const logs = [
    { text: '$ git status', color: '#e2e8f0' },
    { text: 'On branch main: Your branch is up to date with origin/main.', color: '#94a3b8' },
    { text: '$ pnpm run dev', color: '#e2e8f0' },
    { text: '   ▲ Next.js 16.3.4 (Turbo)', color: '#38bdf8' },
    { text: '   - Local:        http://localhost:3000', color: '#4ade80' },
    { text: '   - Network:      http://192.168.1.5:3000', color: '#4ade80' },
    { text: '   - Environments: .env.local', color: '#94a3b8' },
    { text: ' ✓ Ready in 450ms', color: '#22c55e' },
    { text: ' ○ Compiling / ...', color: '#a855f7' },
    { text: ' ✓ Compiled / in 210ms (142 modules)', color: '#22c55e' },
    { text: ' [Supabase] Connected to Postgres DB successfully', color: '#38bdf8' },
    { text: ' [ThreeJS]  WebGL Renderer active with 60 FPS', color: '#facc15' },
    { text: 'hanani@desktop:~/portofolio$ █', color: '#4ade80' }
  ];

  let y = 60;
  logs.forEach((log) => {
    ctx.fillStyle = log.color;
    ctx.font = '13px monospace';
    ctx.fillText(log.text, 18, y);
    y += 26;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export function createPreviewTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Browser background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Browser navbar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, 36);
  ctx.fillStyle = '#334155';
  ctx.roundRect ? ctx.roundRect(140, 6, 520, 24, 6) : ctx.fillRect(140, 6, 520, 24);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('https://hanani-studio.dev/projects', 160, 22);

  // Mock UI Hero Banner
  const grad = ctx.createLinearGradient(0, 50, 800, 220);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(0.5, '#a855f7');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(24, 56, 752, 140);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Featured Fullstack Projects', 48, 100);
  ctx.font = '14px sans-serif';
  ctx.fillText('Scalable web applications, modern interactive design & APIs', 48, 130);

  // Mock cards
  const cards = [
    { title: 'Pantau Sungai', tag: 'IoT & Web GIS', color: '#06b6d4' },
    { title: 'Simmas System', tag: 'Enterprise App', color: '#3b82f6' },
    { title: 'Aurora Web', tag: 'Creative Agency', color: '#8b5cf6' }
  ];

  cards.forEach((c, idx) => {
    const cx = 24 + idx * 258;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx, 220, 236, 170);

    ctx.fillStyle = c.color;
    ctx.fillRect(cx, 220, 236, 6);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(c.title, cx + 16, 260);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px sans-serif';
    ctx.fillText(c.tag, cx + 16, 285);

    ctx.fillStyle = '#475569';
    ctx.fillRect(cx + 16, 310, 180, 10);
    ctx.fillRect(cx + 16, 330, 130, 10);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export function createWallArtTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#2e1065');
  bgGrad.addColorStop(0.4, '#581c87');
  bgGrad.addColorStop(0.7, '#7e22ce');
  bgGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Sun
  const sunGrad = ctx.createRadialGradient(256, 220, 10, 256, 220, 100);
  sunGrad.addColorStop(0, '#fde047');
  sunGrad.addColorStop(0.7, '#f43f5e');
  sunGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(256, 220, 100, 0, Math.PI * 2);
  ctx.fill();

  // Mountain layer 1 (back)
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.moveTo(40, 512);
  ctx.lineTo(180, 280);
  ctx.lineTo(320, 512);
  ctx.closePath();
  ctx.fill();

  // Mountain layer 2 (front)
  ctx.fillStyle = '#1e073c';
  ctx.beginPath();
  ctx.moveTo(160, 512);
  ctx.lineTo(340, 230);
  ctx.lineTo(512, 480);
  ctx.lineTo(512, 512);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export function createFloorGridTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark rich purple-slate base tile
  ctx.fillStyle = '#241e37';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle clean grid lines
  ctx.strokeStyle = '#3a3055';
  ctx.lineWidth = 2;

  const gridSize = 64;
  for (let x = 0; x <= 512; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  for (let y = 0; y <= 512; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
