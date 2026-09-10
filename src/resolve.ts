import { DEFAULT_DARK_COLORS, DEFAULT_TOKENS } from './defaults.ts';
import { TYPE_ROLES, type CaraerTokenSet, type ColorToken, type TypeRole } from './schema.ts';

/** The subset of the backend's `DigitalIdentity` payload the tokens need. */
export interface DigitalIdentityInput {
  [key: string]: unknown;
}

/** The subset of the backend's `WebsiteSettings` payload the tokens need. */
export interface WebsiteSettingsInput {
  maxWebsiteContainerWidth?: number | null;
  headerminHeight?: number | null;
  headerMaxHeight?: number | null;
  headerLayout?: string | null;
  mainStyling?: { all?: StyleSetInput | null } | null;
  customFonts?: Array<{ name?: string | null }> | null;
  [key: string]: unknown;
}

interface StyleSetInput {
  [key: string]: unknown;
}

export interface ResolveTokensOptions {
  digitalIdentity?: DigitalIdentityInput | null;
  websiteSettings?: WebsiteSettingsInput | null;
  colorScheme?: 'light' | 'dark';
}

/**
 * `CssLength` is serialised inconsistently across the backend's DTOs: as a
 * string (`"16px"`), a bare number meaning pixels, or the raw
 * `{ value, unit }` object. Accept all three and fall back when absent.
 */
function cssLength(raw: unknown, fallback: string): string {
  if (raw === null || raw === undefined || raw === '') return fallback;
  if (typeof raw === 'number') return Number.isFinite(raw) ? `${raw}px` : fallback;
  if (typeof raw === 'string') return raw.trim() || fallback;
  if (typeof raw === 'object') {
    const { value, unit } = raw as { value?: unknown; unit?: unknown };
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value}${typeof unit === 'string' && unit ? unit : 'px'}`;
    }
  }
  return fallback;
}

function text(raw: unknown, fallback: string): string {
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : fallback;
}

/**
 * Colours reach us with the `#` missing (`22387d`) or doubled (`##ffffff`),
 * both of which are invalid CSS and would silently drop the whole declaration.
 * Anything that is not bare hex is passed through, so named colours,
 * `rgb()` and `var()` still work.
 *
 * Eight digits are ambiguous. The Flutter editor writes `Color(0xFFRRGGBB)`,
 * putting alpha first, while CSS reads the same digits as `RRGGBBAA` — so a
 * brand navy would render as a translucent red. A leading `ff` decides it:
 * as Flutter it means opaque, and as CSS it would mean full-red, which no
 * stored value has turned out to be. Every other alpha is left to CSS.
 */
function colorValue(raw: unknown, fallback: string): string {
  const value = text(raw, '');
  if (!value) return fallback;

  const hashless = value.replace(/^#+/, '');
  if (/^[0-9a-f]{3,8}$/i.test(hashless)) {
    if (![3, 4, 6, 8].includes(hashless.length)) return fallback;
    if (hashless.length === 8 && /^ff/i.test(hashless)) return `#${hashless.slice(2)}`;
    return `#${hashless}`;
  }
  return value.startsWith('#') ? `#${hashless}` : value;
}

/** Maps a colour role onto its `DigitalIdentity` field for the given scheme. */
function identityField(scheme: 'light' | 'dark', token: ColorToken): string {
  const prefix = scheme;
  const map: Record<ColorToken, string> = {
    primary: 'PrimaryColor',
    'primary-100': 'Primary100Color',
    secondary: 'SecondaryColor',
    accent: 'AccentColor',
    font: 'FontColor',
    background: 'BackgroundColor',
    destructive: 'DestructiveColor',
    black: 'BlackColor',
    white: 'WhiteColor',
    'gray-50': 'Gray50Color',
    'gray-100': 'Gray100Color',
    'gray-200': 'Gray200Color',
    'gray-300': 'Gray300Color',
    'gray-400': 'Gray400Color',
    'gray-500': 'Gray500Color',
    'gray-600': 'Gray600Color',
    'gray-700': 'Gray700Color',
    'gray-800': 'Gray800Color',
    'gray-900': 'Gray900Color',
  };
  return `${prefix}${map[token]}`;
}

/**
 * The `StyleSet` field prefix backing each typography role.
 *
 * `body` and `small` have no dedicated prefix on `StyleSet`; they read the
 * base `font*` fields and the `smallFontSize` scale token respectively.
 */
const TYPE_PREFIX: Record<TypeRole, string | null> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: null,
  small: null,
  nav: 'navigation',
  button: 'button',
};

function resolveTypography(style: StyleSetInput | null | undefined): CaraerTokenSet['type'] {
  const out = {} as CaraerTokenSet['type'];
  const baseFamily = text(style?.fontFamily, DEFAULT_TOKENS.type.body.font);

  for (const role of TYPE_ROLES) {
    const fallback = DEFAULT_TOKENS.type[role];
    const prefix = TYPE_PREFIX[role];

    if (prefix === null) {
      // `body` reads the base font fields; `small` only overrides the size.
      const size =
        role === 'small'
          ? cssLength(style?.smallFontSize, fallback.size)
          : cssLength(style?.fontSize, fallback.size);
      out[role] = {
        font: baseFamily,
        size,
        weight: text(style?.fontWeight, fallback.weight),
        leading: cssLength(style?.fontLineHeight, fallback.leading),
      };
      continue;
    }

    out[role] = {
      font: text(style?.[`${prefix}FontFamily`], baseFamily),
      size: cssLength(style?.[`${prefix}FontSize`], fallback.size),
      weight: text(style?.[`${prefix}FontWeight`], fallback.weight),
      leading: cssLength(style?.[`${prefix}LineHeight`], fallback.leading),
    };
  }

  return out;
}

/**
 * Builds the token set for one request.
 *
 * This runs per request rather than at build time, which is what lets a company
 * change its brand colour and see it live after a cache purge instead of a full
 * site rebuild.
 */
export function resolveTokens(options: ResolveTokensOptions = {}): CaraerTokenSet {
  const scheme = options.colorScheme ?? 'light';
  const identity = options.digitalIdentity ?? {};
  const settings = options.websiteSettings ?? {};
  const style = settings.mainStyling?.all ?? null;

  const colorDefaults = scheme === 'dark' ? DEFAULT_DARK_COLORS : DEFAULT_TOKENS.color;
  const color = {} as CaraerTokenSet['color'];
  for (const token of Object.keys(colorDefaults) as ColorToken[]) {
    color[token] = colorValue(identity[identityField(scheme, token)], colorDefaults[token]);
  }

  const headerHeight = cssLength(
    settings.headerminHeight ?? settings.headerMaxHeight,
    DEFAULT_TOKENS.layout['header-height'],
  );

  return {
    colorScheme: scheme,
    color,
    space: { ...DEFAULT_TOKENS.space },
    radius: { ...DEFAULT_TOKENS.radius },
    type: resolveTypography(style),
    layout: {
      'container-max-width': cssLength(
        settings.maxWebsiteContainerWidth,
        DEFAULT_TOKENS.layout['container-max-width'],
      ),
      'header-height': headerHeight,
      // A disabled header must not push content down.
      'header-offset': settings.headerLayout === 'disabled' ? '0px' : headerHeight,
    },
    breakpoint: { ...DEFAULT_TOKENS.breakpoint },
    shadow: { ...DEFAULT_TOKENS.shadow },
  };
}
