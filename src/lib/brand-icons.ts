import {
  siNetflix,
  siSpotify,
  siYoutube,
  siNotion,
  siApple,
  siGoogle,
} from "simple-icons/icons";

export const BRAND_ICONS = {
  netflix: siNetflix,
  spotify: siSpotify,
  youtube: siYoutube,
  notion: siNotion,
  apple: siApple,
  google: siGoogle,
} as const;

export type BrandSlug = keyof typeof BRAND_ICONS;

export function getBrandIcon(slug?: string) {
  if (!slug) return null;
  return (BRAND_ICONS as Record<string, { title: string; path: string; hex: string }>)[slug] ?? null;
}
