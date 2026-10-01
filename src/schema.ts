/**
 * The canonical list of Caraer CMS design tokens.
 *
 * Every token in this file is guaranteed to be present as a `--caraer-*` custom
 * property on `<html>` of a rendered page, so a module can use any of them
 * without a fallback. The lists are the single source of truth: the TypeScript
 * types, the default stylesheet, the resolver and the generated documentation
 * are all derived from them.
 */

/** Colour roles. Resolved from the company's `DigitalIdentity`. */
export const COLOR_TOKENS = [
  'primary',
  'primary-100',
  'secondary',
  'accent',
  'font',
  'background',
  'destructive',
  'black',
  'white',
  'gray-50',
  'gray-100',
  'gray-200',
  'gray-300',
  'gray-400',
  'gray-500',
  'gray-600',
  'gray-700',
  'gray-800',
  'gray-900',
] as const;

/**
 * Spacing scale, in `rem`.
 *
 * `section` and `gutter` are the two a module should reach for most often:
 * `section` is the vertical rhythm between stacked modules, `gutter` the
 * horizontal breathing room inside the container.
 */
export const SPACE_TOKENS = [
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'section',
  'gutter',
] as const;

/** Corner radii. */
export const RADIUS_TOKENS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

/**
 * Typography roles. Each role expands into four tokens:
 * `--caraer-font-<role>`, `--caraer-size-<role>`, `--caraer-weight-<role>`,
 * `--caraer-leading-<role>`.
 *
 * Resolved from `WebsiteSettings.mainStyling`, which carries the per-element
 * StyleSets the company configures in the typography screen.
 */
export const TYPE_ROLES = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body',
  'small',
  'nav',
  'button',
] as const;

/** Layout tokens. Resolved from `WebsiteSettings`. */
export const LAYOUT_TOKENS = [
  'container-max-width',
  'header-height',
  'header-offset',
] as const;

/** Breakpoints. Fixed by the platform so modules agree on where layouts change. */
export const BREAKPOINT_TOKENS = ['mobile', 'tablet', 'desktop'] as const;

/** Elevation / shadow roles. */
export const SHADOW_TOKENS = ['sm', 'md', 'lg'] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];
export type SpaceToken = (typeof SPACE_TOKENS)[number];
export type RadiusToken = (typeof RADIUS_TOKENS)[number];
export type TypeRole = (typeof TYPE_ROLES)[number];
export type LayoutToken = (typeof LAYOUT_TOKENS)[number];
export type BreakpointToken = (typeof BREAKPOINT_TOKENS)[number];
export type ShadowToken = (typeof SHADOW_TOKENS)[number];

/** Every valid `--caraer-*` custom property name, as a union. */
export type CaraerTokenName =
  | `--caraer-color-${ColorToken}`
  | `--caraer-space-${SpaceToken}`
  | `--caraer-radius-${RadiusToken}`
  | `--caraer-font-${TypeRole}`
  | `--caraer-size-${TypeRole}`
  | `--caraer-weight-${TypeRole}`
  | `--caraer-leading-${TypeRole}`
  | `--caraer-${LayoutToken}`
  | `--caraer-breakpoint-${BreakpointToken}`
  | `--caraer-shadow-${ShadowToken}`;

/** A fully resolved token set, ready to be written onto `<html>`. */
export type CaraerTokens = Record<CaraerTokenName, string>;

/**
 * Structured view of the same values.
 *
 * Passed to modules as `Astro.props.tokens` so a module can branch on a value
 * (for example picking a text colour against the brand colour) rather than only
 * referencing it from CSS.
 */
export interface CaraerTokenSet {
  colorScheme: 'light' | 'dark';
  color: Record<ColorToken, string>;
  space: Record<SpaceToken, string>;
  radius: Record<RadiusToken, string>;
  type: Record<TypeRole, { font: string; size: string; weight: string; leading: string }>;
  layout: Record<LayoutToken, string>;
  breakpoint: Record<BreakpointToken, string>;
  shadow: Record<ShadowToken, string>;
  /**
   * Font sizes that replace the inline (mobile) sizes once the viewport
   * crosses the typography breakpoints. Empty when the company has not set
   * a different size for that device.
   */
  responsiveType?: {
    tablet: Partial<Record<TypeRole, string>>;
    desktop: Partial<Record<TypeRole, string>>;
  };
}

/** Flattens a structured token set into the `--caraer-*` custom properties. */
export function toCustomProperties(set: CaraerTokenSet): CaraerTokens {
  const out = {} as CaraerTokens;
  for (const key of COLOR_TOKENS) out[`--caraer-color-${key}`] = set.color[key];
  for (const key of SPACE_TOKENS) out[`--caraer-space-${key}`] = set.space[key];
  for (const key of RADIUS_TOKENS) out[`--caraer-radius-${key}`] = set.radius[key];
  for (const role of TYPE_ROLES) {
    out[`--caraer-font-${role}`] = set.type[role].font;
    out[`--caraer-size-${role}`] = set.type[role].size;
    out[`--caraer-weight-${role}`] = set.type[role].weight;
    out[`--caraer-leading-${role}`] = set.type[role].leading;
  }
  for (const key of LAYOUT_TOKENS) out[`--caraer-${key}`] = set.layout[key];
  for (const key of BREAKPOINT_TOKENS) out[`--caraer-breakpoint-${key}`] = set.breakpoint[key];
  for (const key of SHADOW_TOKENS) out[`--caraer-shadow-${key}`] = set.shadow[key];
  return out;
}

/** Serialises custom properties into an inline `style` attribute value. */
export function toStyleAttribute(tokens: CaraerTokens): string {
  return Object.entries(tokens)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
}

const SAFE_CSS_LENGTH = /^-?\d*\.?\d+(px|rem|em|%|vw|vh)$/;

/**
 * Tablet and desktop font-size overrides.
 *
 * The inline style on `<html>` is the mobile size, and an inline custom
 * property beats a stylesheet rule, so these declarations are `!important`.
 * Breakpoints match the published typography stylesheet: tablet from 768px,
 * desktop from 1024px.
 */
export function toResponsiveTypeCss(set: CaraerTokenSet): string {
  const blocks: Array<[string, Partial<Record<TypeRole, string>> | undefined]> = [
    ['768px', set.responsiveType?.tablet],
    ['1024px', set.responsiveType?.desktop],
  ];
  return blocks
    .map(([minWidth, sizes]) => {
      if (!sizes) return '';
      const lines = TYPE_ROLES.flatMap((role) => {
        const size = sizes[role];
        if (!size || !SAFE_CSS_LENGTH.test(size)) return [];
        return [`    --caraer-size-${role}: ${size} !important;`];
      });
      if (lines.length === 0) return '';
      return `@media (min-width: ${minWidth}) {\n  :root {\n${lines.join('\n')}\n  }\n}`;
    })
    .filter(Boolean)
    .join('\n');
}
