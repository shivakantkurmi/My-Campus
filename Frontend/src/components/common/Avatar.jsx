// Avatar: shows coloured circle with initials
const COLORS = [
  ['#3b82f6','#1d4ed8'], // blue
  ['#10b981','#065f46'], // green
  ['#8b5cf6','#4c1d95'], // purple
  ['#ef4444','#991b1b'], // red
  ['#f59e0b','#92400e'], // amber
  ['#ec4899','#9d174d'], // pink
  ['#6366f1','#312e81'], // indigo
  ['#14b8a6','#134e4a'], // teal
];

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColors(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name = '', size = 10 }) {
  const initials = getInitials(name);
  const [from, to] = getColors(name);
  // size is a Tailwind spacing unit (1 unit = 4px), e.g. size=10 → 40px
  const px = size * 4;
  const fontSize = Math.max(10, Math.round(px * 0.36));

  return (
    <div
      style={{
        width: px,
        height: px,
        minWidth: px,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '0.02em',
        userSelect: 'none',
        boxShadow: `0 2px 8px ${from}55`,
      }}
    >
      {initials}
    </div>
  );
}
