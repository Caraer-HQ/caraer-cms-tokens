# @caraer/cms-tokens

Caraer CMS v2 design tokens: the contract between company branding and module styling.

This is the single source of truth for the TypeScript types, the default stylesheet, and the resolver that turns `DigitalIdentity` and `WebsiteSettings` into `--caraer-*` custom properties.

## Install

```bash
npm install @caraer/cms-tokens
```

## Usage

```ts
import { DEFAULT_TOKENS, resolveTokens, toCustomProperties } from '@caraer/cms-tokens';
```

For local module development, import the generated defaults so a page renders without a company attached:

```ts
import '@caraer/cms-tokens/tokens.css';
```

Regenerate the stylesheet after changing defaults:

```bash
npm run generate
```

## Related

- [`@caraer/cms-runtime`](https://github.com/Caraer-HQ/caraer-cms-runtime) — module contract and platform components
- [`caraer-web`](https://github.com/Caraer-HQ/caraer-web) — the company website runtime that applies resolved tokens per request
