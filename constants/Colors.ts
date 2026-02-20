export const Colors = {
  light: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#eef2ff',
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    danger: '#dc2626',
    dangerLight: '#fef2f2',
    bg: '#f9fafb',
    surface: '#ffffff',
    surfaceHover: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#374151',
    border: '#e5e7eb',
    borderLight: '#d1d5db',
    inputBg: '#ffffff',
    tabBarBg: '#ffffff',
    tabBarBorder: '#e5e7eb',
    tabBarInactive: '#9ca3af',
  },
  dark: {
    primary: '#818cf8',
    primaryHover: '#6366f1',
    primaryLight: '#1e1b4b',
    success: '#4ade80',
    successLight: '#052e16',
    warning: '#fbbf24',
    warningLight: '#422006',
    danger: '#f87171',
    dangerLight: '#450a0a',
    bg: '#0f1117',
    surface: '#1a1d27',
    surfaceHover: '#252833',
    text: '#e5e7eb',
    textSecondary: '#9ca3af',
    textTertiary: '#d1d5db',
    border: '#2a2d3a',
    borderLight: '#3a3d4a',
    inputBg: '#252833',
    tabBarBg: '#1a1d27',
    tabBarBorder: '#2a2d3a',
    tabBarInactive: '#6b7280',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/* ── Accent color utilities ── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

/** Mix a color toward white. weight 0 = original, 1 = pure white. */
function tint(hex: string, weight: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * weight, g + (255 - g) * weight, b + (255 - b) * weight);
}

/** Mix a color toward black. weight 0 = original, 1 = pure black. */
function shade(hex: string, weight: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - weight), g * (1 - weight), b * (1 - weight));
}

/** Derive primary/primaryHover/primaryLight from a single accent hex. */
export function deriveAccentColors(accent: string, isDark: boolean): Pick<ThemeColors, 'primary' | 'primaryHover' | 'primaryLight'> {
  if (!isDark) {
    return {
      primary: accent,
      primaryHover: shade(accent, 0.12),
      primaryLight: tint(accent, 0.92),
    };
  }
  return {
    primary: tint(accent, 0.4),
    primaryHover: tint(accent, 0.25),
    primaryLight: shade(accent, 0.82),
  };
}
