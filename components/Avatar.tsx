'use client';

import { useMemo } from 'react';

/**
 * Curated background/foreground pairs. The text hue is deliberately different
 * from the background hue — same-hue tints read as generic, mismatched hues
 * give each person a recognisable combination.
 */
const PAIRS: { bg: string; fg: string }[] = [
  { bg: '#FFE2D6', fg: '#1F6F5C' }, // peach / deep teal
  { bg: '#E5EEFF', fg: '#C2410C' }, // pale blue / burnt orange
  { bg: '#FFF0C2', fg: '#6B3FA0' }, // butter / violet
  { bg: '#DCF3F7', fg: '#B03060' }, // ice / magenta
  { bg: '#FFE4EE', fg: '#1D4ED8' }, // pink / cobalt
  { bg: '#EDE7DA', fg: '#0E5A8A' }, // sand / ink blue
  { bg: '#E0F2E9', fg: '#7C2D12' }, // sage / brown
  { bg: '#FFEAD5', fg: '#3730A3' }, // apricot / indigo
  { bg: '#E8EAF6', fg: '#B45309' }, // periwinkle / dark amber
  { bg: '#F3E4FF', fg: '#15803D' }, // lilac / green
  { bg: '#F0E6D2', fg: '#155E75' }, // cream / petrol
  { bg: '#E3F0DA', fg: '#7E22CE' }, // pistachio / purple
];

export default function Avatar({
  name,
  email,
  className,
}: {
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  const seed = useMemo(() => (email || name || '').trim().toLowerCase(), [email, name]);
  const pair = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return PAIRS[Math.abs(hash) % PAIRS.length];
  }, [seed]);
  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  }, [name]);

  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full text-sm font-semibold ${className || ''}`}
      style={{ backgroundColor: pair.bg, color: pair.fg }}
    >
      <span className="leading-none">{initials.toUpperCase()}</span>
    </span>
  );
}
