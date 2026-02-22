// Avatar: shows profile image or initials-based coloured circle
const COLORS = [
  'bg-blue-500','bg-green-500','bg-purple-500','bg-red-500',
  'bg-yellow-500','bg-pink-500','bg-indigo-500','bg-teal-500',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name = '', photo = '', size = 10 }) {
  const initials = getInitials(name);
  const color = getColor(name);
  const dim = `w-${size} h-${size}`;

  if (photo)
    return (
      <img
        src={photo}
        alt={name}
        className={`${dim} rounded-full object-cover ring-2 ring-blue-400`}
      />
    );

  return (
    <div
      className={`${dim} ${color} rounded-full flex items-center justify-center text-white font-bold text-sm select-none`}
    >
      {initials}
    </div>
  );
}
