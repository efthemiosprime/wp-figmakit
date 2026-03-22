# WP Figmakit Theme

A Gutenberg-ready WordPress theme with a design-token-driven, component/block based approach — extended with a visual toolbar, utility-first CSS system, and page builder capabilities. Also serves as the starting point for the FigmaKit plugin.

- **Author**: Efthemios Suyat (support@figmakit.dev)
- **Version**: 1.0.0
- **Build System**: Vite 6.0 + SASS
- **Architecture**: Modular PHP includes, React-based editor extensions

---

## Table of Contents

- [Getting Started](#getting-started)
- [File Structure](#file-structure)
- [Build System](#build-system)
- [Theme Configuration](#theme-configuration)
- [FigmaKit Toolbar](#figmakit-toolbar)
- [Custom Blocks](#custom-blocks)
- [Block Editor Extensions](#block-editor-extensions)
- [Design Tokens & CSS Utilities](#design-tokens--css-utilities)
- [Grid System](#grid-system)
- [REST API Endpoints](#rest-api-endpoints)
- [Templates & Patterns](#templates--patterns)
- [Security](#security)
- [Admin Options](#admin-options)
- [Figma Token Integration](#figma-token-integration)

---

## Getting Started

### Requirements

- WordPress 6.0+
- PHP 7.4+
- Node.js 18+

### Installation

```bash
# Navigate to theme directory
cd wp-content/themes/wp-figmakit

# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Production build
npm run build
```

The Vite dev server runs on port **5173**. In production, assets are output to `dist/` with hashed filenames and a manifest for cache-busting.

---

## File Structure

```
wp-figmakit/
├── functions.php              # Theme setup, modular loader
├── theme.json                 # WP Theme JSON v3 settings
├── vite.config.js             # Vite build configuration
├── package.json               # Dependencies (sass, vite)
│
├── inc/                       # PHP modules
│   ├── assets.php             # Vite integration & asset loading
│   ├── blocks.php             # Block registration & auto-discovery
│   ├── patterns.php           # Block pattern registration
│   ├── templates.php          # Menus & widget areas
│   ├── admin.php              # Options page, CSP, code injection
│   ├── security.php           # Security hardening
│   ├── figma-tokens.php       # Figma token → theme.json merging
│   ├── grid-api.php           # Grid settings REST API
│   ├── colors-api.php         # Color tokens REST API
│   ├── policies-api.php       # Block policies REST API
│   ├── class-fk-header-nav-walker.php  # Custom nav walker for header block
│   ├── block-attributes.php   # Custom HTML attributes on blocks
│   ├── block-policies.php     # Style class system for blocks
│   ├── block-spacing.php      # Spacing utility classes
│   ├── block-layout.php       # Flexbox/display layout classes
│   ├── block-sizing.php       # Width/height utility classes
│   ├── block-text-style.php   # Typography utility classes
│   ├── button-icons.php       # Button icon injection
│   └── responsive-visibility.php  # Responsive show/hide
│
├── blocks/                    # Server-side block definitions
│   ├── card/                  # block.json + render.php
│   ├── cta/
│   ├── feature/
│   ├── header/                # Site header with nav menus
│   ├── hero/
│   └── testimonial/
│
├── templates/                 # FSE block templates
│   ├── index.html
│   ├── page.html
│   ├── single.html
│   ├── archive.html
│   ├── search.html
│   ├── 404.html
│   ├── blank.html
│   └── full-width.html
│
├── parts/                     # Template parts
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
│
├── patterns/                  # Block patterns
│   └── hero.php
│
└── src/                       # Vite source
    ├── main.js                # Frontend entry point
    ├── editor.js              # Editor entry point
    ├── blocks/                # Block editor interfaces (JSX)
    │   ├── card/
    │   ├── cta/
    │   ├── feature/
    │   ├── header/            # Header block editor + frontend JS
    │   ├── hero/
    │   └── testimonial/
    ├── components/            # Editor enhancement components
    │   ├── figmakit-toolbar/  # Custom floating toolbar
    │   ├── block-attributes/
    │   ├── block-policies/
    │   ├── block-spacing/
    │   ├── block-layout/
    │   ├── block-sizing/
    │   ├── block-text-style/
    │   ├── block-columns/
    │   ├── button-icons/
    │   ├── grid-settings/
    │   └── responsive-visibility/
    └── styles/
        ├── main.scss          # Frontend styles
        ├── editor.scss        # Editor styles
        └── design-tokens/
            ├── _variables.scss
            ├── _colors.scss
            ├── _types.scss
            ├── _spacing.scss
            ├── _grid.scss
            └── _utils.scss
```

---

## Build System

**Vite 6.0** handles all asset compilation.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

### Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| `main` | `src/main.js` | Frontend styles, scripts, and header mobile toggle |
| `editor` | `src/editor.js` | Block editor extensions and toolbar |
| `block-*` | `src/blocks/*/index.js` | Auto-discovered per-block scripts |

### JSX Configuration

JSX is compiled using WordPress globals:

```js
// vite.config.js
esbuild: {
    jsxFactory: 'wp.element.createElement',
    jsxFragment: 'wp.element.Fragment',
}
```

### Asset Loading

The theme uses a Vite manifest for production and a direct dev server connection for development:

- `wp_figmakit_is_vite_dev()` — detects if the dev server is running
- `wp_figmakit_get_manifest()` — reads `dist/.vite/manifest.json`
- `wp_figmakit_enqueue_entry()` — loads entries with HMR or hashed production URLs
- All `wp-figmakit` prefixed scripts are output with `type="module"` via `script_loader_tag` filter

---

## Theme Configuration

### theme.json

The theme uses WordPress Theme JSON v3 with:

**Color Palette:**

| Token | Default | CSS Variable |
|-------|---------|--------------|
| Primary | `#1a1a2e` | `--wp--preset--color--primary` |
| Secondary | `#16213e` | `--wp--preset--color--secondary` |
| Accent | `#0f3460` | `--wp--preset--color--accent` |
| Highlight | `#e94560` | `--wp--preset--color--highlight` |
| Surface | `#ffffff` | `--wp--preset--color--surface` |
| Muted | `#666666` | `--wp--preset--color--muted` |

**Typography:**

- **System font**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
- **Monospace**: SF Mono, Fira Code, Cascadia Code, monospace
- **Sizes**: small (0.875rem), medium (1rem), large (1.5rem), x-large (2rem), xx-large (3rem)

**Spacing units**: px, em, rem, %, vw, vh

---

## FigmaKit Toolbar

A custom floating toolbar rendered on the left side of the block editor. It provides quick access to theme-level settings without navigating the WordPress sidebar.

### Toolbar Architecture

The toolbar is a standalone React component mounted directly to the DOM (not using WordPress `registerPlugin` or SlotFill). It consists of:

- **Toolbar.jsx** — Main component with panel state management
- **ToolbarButton.jsx** — Individual icon buttons (40x40px)
- **FlyoutPanel.jsx** — Slide-out panels (300px default, supports custom width via `className` prop)
- **icons.jsx** — Lucide-style SVG icons (GridIcon, PaletteIcon, FormIcon, PortabilityIcon, LayoutIcon)

The toolbar is hidden in the Site Editor and only appears in the post/page editor.

### Panels

#### Grid Settings
Controls the global grid/container system:
- Container max width (default: 1440px)
- Container padding — desktop (160px), tablet (32px), mobile (24px)
- Gutter — desktop (24px), mobile (16px)

Updates CSS custom properties live in the editor iframe.

#### Colors
Manages theme color tokens with a visual color picker:
- 7 default colors: primary, secondary, accent, highlight, text, text-light, background
- Support for custom colors (add/remove)
- Live CSS variable updates in the editor

#### Patterns (Pattern Library)
Visual pattern library panel (600px wide, 2-column grid) for managing reusable block patterns:
- **Browse**: Visual preview cards using `wp.blockEditor.BlockPreview`
- **Search**: Filter patterns by name
- **Insert**: Click a pattern card to insert blocks at cursor position
- **Save**: Save currently selected blocks as a new reusable pattern
- **Rename**: Inline rename with Enter to confirm, Escape to cancel
- **Delete**: Remove patterns with confirmation dialog

Uses the WordPress `/wp/v2/blocks` REST API (Synced Patterns / Reusable Blocks).

#### Block Policies (Style Classes)
Defines allowed CSS classes per block type:
- Map class names to human-readable labels
- Assign classes to specific block types (Group, Paragraph, Heading, Image, Button, etc.)
- Classes appear as checkboxes in each block's inspector panel

#### Portability (Export/Import)
Export and import entire page layouts as JSON files:

**Export:**
- Serializes all page blocks using `wp.blocks.serialize()`
- Downloads a `.json` file containing the full block markup
- Preserves all attributes, classes, styles, nested blocks, and custom data (`fkAttributes`, `fkPolicyClasses`, etc.)

**Import:**
- **Replace mode**: Replaces all page blocks with the imported content
- **Append mode**: Adds imported blocks after existing content
- Parses block markup using `wp.blocks.parse()`
- Fully integrated with Gutenberg's undo stack (Ctrl+Z works)

**JSON format (v1):**
```json
{
  "version": 1,
  "generator": "figmakit",
  "title": "Page Title",
  "date": "2026-03-22T...",
  "content": "<!-- wp:paragraph {\"className\":\"my-class\"} -->..."
}
```

### Adding a New Panel

1. Create a panel component in `src/components/figmakit-toolbar/panels/`
2. Add an icon to `icons.jsx`
3. Register in the `PANELS` array in `Toolbar.jsx`:
```js
{ id: 'my-panel', icon: MyIcon, label: 'My Panel', component: MyPanel }
```

---

## Custom Blocks

All blocks are in the `wp-figmakit` category and use server-side rendering via `render.php`.

### Header (`wp-figmakit/fk-header`)

Site header block with logo, utility navigation, and main navigation. Used as the default header template part.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"default"` | Layout variant |
| `utilityMenuId` | number | `0` | WordPress nav_menu term ID for utility nav |
| `mainMenuId` | number | `0` | WordPress nav_menu term ID for main nav |
| `showUtilityMenu` | boolean | `true` | Toggle utility menu visibility |
| `showSkipLink` | boolean | `true` | Toggle skip-to-content link |

**Variants:**
- **`default`** — Logo flush left, utility menu and main menu stacked flush right
- **`header-utility-top`** — Utility nav on top row, logo + main nav on bottom row

**Features:**
- Menu items populated from WordPress registered menus via dropdown selector
- Live menu preview in the editor (fetches actual menu items via REST API)
- Logo area uses InnerBlocks (`core/site-logo`, `core/image`, `core/group`)
- Server-side rendering with custom `FK_Header_Nav_Walker` for BEM-style HTML output
- Mobile hamburger toggle with animated X, `aria-expanded`, and Escape key handling
- Skip-to-content link for accessibility
- WCAG AA compliant: `role="banner"`, distinct `aria-label` on each nav, `aria-expanded` on dropdowns, `:focus-visible` outlines

**Mobile behavior** (< 768px):
- Hamburger toggle (fixed position, top-right)
- Menus stack vertically: main menu first, utility menu below
- Submenus collapsed, toggled via tap/click

CSS classes: `.fk-header`, `.fk-header--{variant}`, `.fk-header__inner`, `.fk-header__logo`, `.fk-header__menus`, `.fk-header__utility`, `.fk-header__primary`

### Card (`wp-figmakit/fk-card`)

Flexible card component with configurable sections.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"vstack"` | Layout variant |
| `showImage` | boolean | `true` | Toggle image section |
| `showEyebrow` | boolean | `true` | Toggle eyebrow text |
| `showButtons` | boolean | `true` | Toggle CTA buttons |
| `showFootnote` | boolean | `true` | Toggle footnote |

CSS classes: `.fk-card`, `.fk-card--{variant}`

### Call to Action (`wp-figmakit/fk-cta`)

CTA section with heading, description, and buttons.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"centered"` | Layout variant |
| `alignment` | string | `"center"` | Text alignment |

CSS classes: `.fk-cta`, `.fk-cta--{variant}`, `.has-text-align-{alignment}`

### Feature (`wp-figmakit/fk-feature`)

Feature block with icon/image, title, and description.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"vstack"` | Layout variant |
| `iconPosition` | string | `"top"` | Icon/image position |

CSS classes: `.fk-feature`, `.fk-feature--{variant}`

### Hero (`wp-figmakit/fk-hero`)

Hero/banner section with heading, description, and CTA.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"centered"` | Layout variant |
| `showOverlay` | boolean | `false` | Background overlay |
| `minHeight` | string | `"60vh"` | Minimum section height |
| `showButtons` | boolean | `true` | Toggle CTA buttons |

CSS classes: `.fk-hero`, `.fk-hero--{variant}`, `.fk-hero--overlay`

### Testimonial (`wp-figmakit/fk-testimonial`)

Testimonial/quote block with avatar and attribution.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"standard"` | Layout variant |
| `showAvatar` | boolean | `true` | Toggle avatar |
| `showRole` | boolean | `true` | Toggle role text |

CSS classes: `.fk-testimonial`, `.fk-testimonial--{variant}`

---

## Block Editor Extensions

All extensions use WordPress `addFilter()` on `blocks.registerBlockType` and `editor.BlockEdit` to inject custom attributes and inspector panels into every block.

### Block Attributes (`fkAttributes`)

Add custom HTML attributes to any block: `class`, `id`, `title`, `alt`, `rel`, `target`, `role`, `aria-label`, and `data-*`.

Applied on the server via `WP_HTML_Tag_Processor` in the `render_block` filter.

### Block Policies / Style Classes (`fkPolicyClasses`)

Checkboxes in the block inspector to toggle predefined CSS classes. Classes are defined per block type in the Policies toolbar panel.

### Responsive Visibility (`fkVisibility`)

Show/hide any block per breakpoint:

| Class | Breakpoint |
|-------|-----------|
| `fk-hide-desktop` | 1025px+ |
| `fk-hide-tablet` | 768px–1024px |
| `fk-hide-mobile` | 0–767px |

### Block Spacing (`fkSpacing`)

Padding and margin utility classes applied via inspector controls:

- **Pattern**: `{side}-{value}` (e.g., `pt-16`, `mb-24`)
- **Sides**: `pt`, `pb`, `pl`, `pr`, `mt`, `mb`, `ml`, `mr`
- Auto-adds `fk-d-block` when left+right margins are `auto` (centering)

### Block Layout (`fkLayout`)

Flexbox and display layout controls with responsive variants:

| Category | Classes |
|----------|---------|
| Display | `fk-d-block`, `fk-d-flex`, `fk-d-iflex`, `fk-d-grid`, `fk-d-none` |
| Direction | `fk-dir-row`, `fk-dir-row-r`, `fk-dir-col`, `fk-dir-col-r` |
| Justify | `fk-jc-start`, `fk-jc-center`, `fk-jc-end`, `fk-jc-between`, `fk-jc-around`, `fk-jc-evenly` |
| Align | `fk-ai-start`, `fk-ai-center`, `fk-ai-end`, `fk-ai-stretch`, `fk-ai-baseline` |
| Wrap | `fk-wrap`, `fk-nowrap` |
| Gap | `gap-3xl` through `gap-4xs`, `gap-0` |

Responsive prefixes: `fk-t-` (tablet), `fk-m-` (mobile)

### Block Sizing (`fkSizing`)

Width, height, and overflow controls:

| Category | Classes |
|----------|---------|
| Width | `fk-w-auto`, `fk-w-25`, `fk-w-33`, `fk-w-50`, `fk-w-66`, `fk-w-75`, `fk-w-full`, `fk-w-screen` |
| Max-Width | `fk-mw-none`, `fk-mw-xs` through `fk-mw-3xl`, `fk-mw-full` |
| Height | `fk-h-auto`, `fk-h-25`, `fk-h-50`, `fk-h-75`, `fk-h-full`, `fk-h-screen` |
| Min-Height | `fk-mnh-0`, `fk-mnh-xs` through `fk-mnh-2xl`, `fk-mnh-full`, `fk-mnh-screen` |
| Max-Height | `fk-mxh-none`, `fk-mxh-full`, `fk-mxh-screen` |
| Overflow | `fk-of-hidden`, `fk-of-auto`, `fk-of-visible`, `fk-of-scroll` |

### Block Text Style (`fkTextStyle`)

Typography utility classes:

| Class | Description |
|-------|-------------|
| `fk-text-title` | 48px (36px tablet, 28px mobile) |
| `fk-text-subtitle` | 32px (26px tablet, 22px mobile) |
| `fk-text-eyebrow` | 12px, uppercase, tracked |
| `fk-text-body-lg` | 18px (16px mobile) |
| `fk-text-body-md` | 16px |
| `fk-text-body-sm` | 14px |
| `fk-text-caption` | 12px |
| `fk-text-footnote` | 11px |
| `fk-text-link` | 16px |

Font weights: `fk-fw-light` (300) through `fk-fw-black` (900)

Font families: `fk-ff-sans`, `fk-ff-mono`

### Button Icons (`fkButtonIcon`)

Inject Dashicons into core/button blocks with configurable position (`before` or `after`).

---

## Design Tokens & CSS Utilities

Design tokens are defined as SCSS variables and CSS custom properties in `src/styles/design-tokens/`.

### Color Tokens (`_colors.scss`)

```css
--fk-color-primary: #1a1a2e;
--fk-color-secondary: #16213e;
--fk-color-accent: #0f3460;
--fk-color-highlight: #e94560;
--fk-color-text: #333;
--fk-color-text-light: #666;
--fk-color-bg: #fff;
```

Colors are manageable from the toolbar Colors panel and output as CSS custom properties via `wp_head`.

### Spacing Scale (`_spacing.scss`)

| Token | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| `--spacing-3xl` | 96px | 64px | 48px |
| `--spacing-2xl` | 80px | 56px | 40px |
| `--spacing-xl` | 64px | 48px | 32px |
| `--spacing-lg` | 48px | 40px | 28px |
| `--spacing-md` | 32px | 28px | 24px |
| `--spacing-sm` | 24px | 20px | 16px |
| `--spacing-xs` | 16px | 14px | 12px |
| `--spacing-2xs` | 12px | 10px | 8px |
| `--spacing-3xs` | 8px | 6px | 6px |
| `--spacing-4xs` | 4px | 4px | 4px |

**Utility classes**: `.p-{size}`, `.m-{size}`, `.py-{size}`, `.px-{size}`, `.pt-{size}`, `.pb-{size}`, `.pl-{size}`, `.pr-{size}`, `.mt-{size}`, `.mb-{size}`, `.ml-{size}`, `.mr-{size}`, `.gap-{size}`, `.gap-x-{size}`, `.gap-y-{size}`

**Section spacing**: `.section` (default vertical rhythm), `.section-3xl` through `.section-sm`

### Typography Scale (`_types.scss`)

| Token | Value |
|-------|-------|
| `--fk-fs-title` | 48px (responsive) |
| `--fk-fs-subtitle` | 32px (responsive) |
| `--fk-fs-eyebrow` | 12px |
| `--fk-fs-body-lg` | 18px (responsive) |
| `--fk-fs-body-md` | 16px |
| `--fk-fs-body-sm` | 14px |
| `--fk-fs-caption` | 12px |
| `--fk-fs-footnote` | 11px |
| `--fk-fs-link` | 16px |

Line heights: `--fk-lh-tight` (1.2), `--fk-lh-normal` (1.5), `--fk-lh-relaxed` (1.75)

### Breakpoints (`_variables.scss`)

| Breakpoint | Value |
|-----------|-------|
| Desktop min | 1025px |
| Tablet max | 980px |
| Mobile max | 767px |

---

## Grid System

A 12-column responsive grid with `fk-` prefix, defined in `_grid.scss`.

### Container

```html
<div class="fk-container">...</div>
<div class="fk-container-fluid">...</div>
```

| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Max width | 1440px | 100% | 100% |
| Padding | 160px | 32px | 24px |

Container values are configurable from the Grid Settings toolbar panel.

### Row & Columns

```html
<div class="fk-row">
    <div class="fk-col-6">Half width</div>
    <div class="fk-col-6">Half width</div>
</div>
```

- **Columns**: `fk-col-1` through `fk-col-12`, `fk-col-auto`, `fk-col` (flex: 1)
- **Tablet**: `fk-col-t-1` through `fk-col-t-12`, `fk-col-t-auto`, `fk-col-t-full`
- **Mobile**: `fk-col-m-1` through `fk-col-m-12`, `fk-col-m-auto`, `fk-col-m-full` (columns stack by default)
- **No gutter**: `fk-row-no-gutter`

### Offsets

```html
<div class="fk-col-6 fk-offset-3">Centered column</div>
```

- **Left offset**: `fk-offset-0` through `fk-offset-11`
- **Right offset**: `fk-offset-r-1` through `fk-offset-r-11`
- **Responsive**: `fk-offset-t-{n}`, `fk-offset-m-{n}`

### Column Order

- `fk-order-1` through `fk-order-12`
- `fk-order-first`, `fk-order-last`
- Responsive: `fk-order-t-first/last`, `fk-order-m-first/last`

### Section

```html
<section class="fk-section">...</section>
```

Applies vertical padding using the spacing scale for consistent page rhythm.

---

## REST API Endpoints

All endpoints are under the `wp-figmakit/v1` namespace and require authentication.

### Grid Settings

```
GET  /wp-figmakit/v1/grid-settings    # Requires: edit_posts
POST /wp-figmakit/v1/grid-settings    # Requires: manage_options
```

**Fields**: `grid_container_max`, `grid_container_padding`, `grid_container_padding_tablet`, `grid_container_padding_mobile`, `grid_gutter`, `grid_gutter_mobile`

Values are validated as CSS units (`/^[\d.]+(px|em|rem|%|vw)$/`).

### Color Settings

```
GET  /wp-figmakit/v1/color-settings   # Requires: edit_posts
POST /wp-figmakit/v1/color-settings   # Requires: manage_options
```

**Fields**: `color_primary`, `color_secondary`, `color_accent`, `color_highlight`, `color_text`, `color_text_light`, `color_bg`, plus `_custom_colors` for user-defined tokens.

Values are validated with `sanitize_hex_color()`.

### Policies

```
GET  /wp-figmakit/v1/policies         # Requires: edit_posts
POST /wp-figmakit/v1/policies         # Requires: manage_options
```

**Structure**: `{ "core/group": [{ "label": "Card Shadow", "class": "card-shadow" }] }`

---

## Templates & Patterns

### Block Templates (FSE)

| Template | Description |
|----------|-------------|
| `index.html` | Default fallback |
| `page.html` | Page template |
| `single.html` | Single post |
| `archive.html` | Archive listing |
| `search.html` | Search results |
| `404.html` | Not found |
| `blank.html` | No header/footer |
| `full-width.html` | Full-width layout |

### Template Parts

| Part | Description |
|------|-------------|
| `header.html` | FK Header block (logo + utility/main nav) |
| `footer.html` | Site footer |
| `sidebar.html` | Sidebar widget area |

### Navigation Menus

- **Primary** — Main site navigation
- **Utility** — Utility/secondary navigation (used by header block)
- **Footer** — Footer navigation

### Block Patterns

- **Hero** (`wp-figmakit/hero`) — Cover block with heading, paragraph, and buttons

---

## Security

The theme includes comprehensive security hardening in `inc/security.php`:

| Feature | Description |
|---------|-------------|
| CORS Restriction | Same-origin only, editors/admins only for REST |
| Security Headers | HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy |
| Content Security Policy | Configurable CSP with preset directives for GA, GTM, OneTrust, Facebook, Bing, Clarity, Cloudflare |
| XML-RPC | Disabled |
| Version Hiding | WordPress version removed from headers and feeds |
| File Editing | `DISALLOW_FILE_EDIT` enforced |
| Sensitive Files | Blocks access to license.txt, readme.html, wp-config.php, .htaccess, error_log, debug.log |
| Comment Sanitization | XSS prevention on author, email, URL, and content |
| Secure Cookies | HttpOnly, Secure, SameSite=Lax (PHP 7.3+) |
| User Enumeration | REST users endpoint and author archives blocked for unauthenticated users |

---

## Admin Options

Available at **Appearance > Figmakit Options** in the WordPress admin.

### Code Integration

Inject custom code at various points in the page:

| Field | Hook | Priority |
|-------|------|----------|
| Head Code | `wp_head` | 99 |
| Body Open Code | `wp_body_open` | 10 |
| Post Top Code | `the_content` (prepend) | 99 |
| Post Bottom Code | `the_content` (append) | 99 |

Each injection point has an enable/disable toggle.

### Grid Settings

Configurable via admin page or toolbar panel. Output as CSS custom properties:

```css
:root {
    --fk-container-max: 1440px;
    --fk-container-padding: 160px;
    --fk-container-padding-tablet: 32px;
    --fk-container-padding-mobile: 24px;
    --fk-gutter: 24px;
    --fk-gutter-mobile: 16px;
}
```

### Content Security Policy

Full CSP configuration with per-directive controls and pre-configured defaults for common third-party services.

---

## Figma Token Integration

The theme can optionally merge Figma design tokens into `theme.json` at runtime.

- Reads `figma-tokens.json` from the theme root (if present)
- Merges tokens via the `wp_theme_json_data_theme` filter
- Gracefully handles missing file — theme works independently

---

## Data Storage

All theme settings are stored in the `wp_figmakit_options` WordPress option (serialized array). Access via:

```php
$value = wp_figmakit_get_option('grid_container_max', '1440px');
```

---

## Extending the Theme

### PHP Hooks

| Hook | Type | Description |
|------|------|-------------|
| `render_block` | Filter | Block attribute, spacing, layout, sizing, text style, and policy class injection |
| `wp_theme_json_data_theme` | Filter | Figma token merging |
| `send_headers` | Action | Security headers and CSP |
| `wp_head` | Action | Grid CSS vars, color CSS vars, custom head code |
| `wp_body_open` | Action | Custom body code |
| `the_content` | Filter | Post top/bottom code injection |

### Adding a Custom Block

1. Create `blocks/{block-name}/block.json` and `blocks/{block-name}/render.php`
2. Create `src/blocks/{block-name}/index.js` for the editor interface
3. Blocks are auto-discovered by `inc/blocks.php` and `vite.config.js`
4. Run `npm run build` to compile

### Adding an Editor Extension

1. Create a component in `src/components/{name}/index.jsx`
2. Use `addFilter('blocks.registerBlockType', ...)` to add attributes
3. Use `addFilter('editor.BlockEdit', ...)` to add inspector controls
4. Import in `src/editor.js`
5. Add server-side rendering in `inc/{name}.php` using the `render_block` filter
