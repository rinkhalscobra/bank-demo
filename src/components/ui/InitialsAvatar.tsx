export default function InitialsAvatar({ name, inverse = false, className = '' }: { name: string; inverse?: boolean; className?: string }) {
  const initials = name.trim().split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).slice(0, 2).map((word) => [...word][0]).join('').toLocaleUpperCase() || '?';
  return <span
    aria-hidden="true"
    className={`inline-flex shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${className}`}
    style={inverse
      ? { color: '#fff', backgroundColor: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.25)' }
      : { color: 'var(--palette-primary, #244A73)', backgroundColor: 'color-mix(in srgb, var(--palette-primary, #244A73) 8%, white)', borderColor: 'color-mix(in srgb, var(--palette-primary, #244A73) 15%, white)' }}
  >{initials}</span>;
}
