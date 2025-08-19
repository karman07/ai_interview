export default function Avatar({ src, name, size = 56 }: { src?: string; name: string; size?: number }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover ring-2 ring-white shadow"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold ring-2 ring-white shadow"
    >
      {initials || '?'}
    </div>
  );
}
