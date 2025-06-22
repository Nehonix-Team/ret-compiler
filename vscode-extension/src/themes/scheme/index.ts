import { FortifyColorScheme } from "../color.scheme";
import { COOL_COLOR_SCHEME } from "./COOL_COLOR_SCHEME";
import { CYBERPUNK_COLOR_SCHEME } from "./CYBERPUNK_COLOR_SCHEME";
import { DEFAULT_COLOR_SCHEME } from "./DEFAULT_COLOR_SCHEME";
import { DEFAULT_V2_COLOR_SCHEME } from "./DEFAULT_V2_COLOR_SCHEME";
import { MATRIX_CODE_COLOR_SCHEME } from "./MATRIX_CODE_COLOR_SCHEME";
import { OCEAN_DEPTH_COLOR_SCHEME } from "./OCEAN_DEPTH_COLOR_SCHEME";
import { PASTEL_DREAM_COLOR_SCHEME } from "./PASTEL_DREAM_COLOR_SCHEME";
import { RETRO_WAVE_COLOR_SCHEME } from "./RETRO_WAVE_COLOR_SCHEME";
import { SUNSET_VIBES_COLOR_SCHEME } from "./SUNSET_VIBES_COLOR_SCHEME";
import { SYNTHWAVE_COLOR_SCHEME } from "./SYNTHWAVE_COLOR_SCHEME";
import { DEFAULT_MINIMAL, DEFAULT_VIBRANT } from "./VIBRANT&Minimal";

/**
 * @name cool
 * Cool-toned palette with excellent contrast and modern feel
 */
export * from "./COOL_COLOR_SCHEME";
/**
 * @name CYBERPUNK_COLOR_SCHEME
 * Neon cyberpunk scheme - vibrant and futuristic 🌈⚡
 */

export * from "./CYBERPUNK_COLOR_SCHEME";

/**
 * @name DEFAULT_COLOR_SCHEME
 * Modern, user-friendly colors optimized for readability and visual hierarchy
 */
export * from "./DEFAULT_COLOR_SCHEME";

/**
 * @name PASTEL_DREAM_COLOR_SCHEME
 * Soft pastel colors for a dreamy, aesthetic coding vibe 🌙
 * Pastel dream scheme - soft and aesthetic 🌸✨
 */
export * from "./PASTEL_DREAM_COLOR_SCHEME";

/**
 * @name VIBRANT&Minimal
 * Vibrant colors for better visual distinction
 * Minimal colors for a clean, distraction-free experience
 */
export * from "./VIBRANT&Minimal";

/**
 * @name DEFAULT_V2_COLOR_SCHEME&Minimal
 * A v2 for DEFAULT_COLOR_SCHEME
 */
export * from "./DEFAULT_V2_COLOR_SCHEME";

/**
 * @name OCEAN_DEPTH_COLOR_SCHEME&Minimal
 *  Ocean depth scheme - deep blues and teals 🌊🐋
 */
export * from "./OCEAN_DEPTH_COLOR_SCHEME";

/**
 * @name SYNTHWAVE_COLOR_SCHEME
 *   Retro synthwave scheme - 80s vibes with hot pinks and electric blues 🌆🎵
 */
export * from "./SYNTHWAVE_COLOR_SCHEME";

//
/**
 * @name SUNSET_VIBES_COLOR_SCHEME
 *  Sunset Vibes scheme - warm oranges and purples 🌅🏖️
 */
export * from "./SUNSET_VIBES_COLOR_SCHEME";

/**
 * @name MATRIX_CODE_COLOR_SCHEME
 *  Matrix Code scheme - green on black hacker vibes 💚🖥️
 */
export * from "./MATRIX_CODE_COLOR_SCHEME";

/**
 * @name RETRO_WAVE_COLOR_SCHEME
 *  Retro Wave scheme - 80s synthwave vibes 🌸💜
 */
export * from "./RETRO_WAVE_COLOR_SCHEME";

export const AllSchemsByName: Record<
  FortifyColorScheme["name"],
  FortifyColorScheme
> = {
  COOL_COLOR_SCHEME,
  CYBERPUNK_COLOR_SCHEME,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_V2_COLOR_SCHEME,
  PASTEL_DREAM_COLOR_SCHEME,
  DEFAULT_VIBRANT,
  DEFAULT_MINIMAL,
  OCEAN_DEPTH_COLOR_SCHEME,
  SYNTHWAVE_COLOR_SCHEME,
  SUNSET_VIBES_COLOR_SCHEME,
  MATRIX_CODE_COLOR_SCHEME,
  RETRO_WAVE_COLOR_SCHEME,
};
