# WP Figmakit Theme

A Gutenberg-ready WordPress theme with a design-token-driven, component/block based approach — extended with a visual toolbar, utility-first CSS system, and page builder capabilities.

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
  - [Grid Settings](#grid-settings)
  - [Colors](#colors)
  - [Patterns](#patterns)
  - [Block Policies](#block-policies)
  - [Portability](#portability)
- [Custom Blocks](#custom-blocks)
  - [Header](#header-wp-figmakitfk-header)
  - [Card](#card-wp-figmakitfk-card)
  - [Tabs](#tabs-wp-figmakitfk-tabs)
  - [Hero](#hero-wp-figmakitfk-hero)
  - [CTA](#call-to-action-wp-figmakitfk-cta)
  - [Feature](#feature-wp-figmakitfk-feature)
  - [Testimonial](#testimonial-wp-figmakitfk-testimonial)
- [Block Editor Extensions](#block-editor-extensions)
  - [Spacing](#spacing-fkspacing)
  - [Layout](#layout-fklayout)
  - [Sizing](#sizing-fksizing)
  - [Text Style](#text-style-fktextstyle)
  - [Visibility](#responsive-visibility-fkvisibility)
  - [Attributes](#custom-attributes-fkattributes)
  - [Button Icons](#button-icons-fkbuttonicon)
- [Design Tokens & CSS Utilities](#design-tokens--css-utilities)
- [Grid System](#grid-system)
- [REST API Endpoints](#rest-api-endpoints)
- [Templates & Patterns](#templates--patterns)
- [Security](#security)
- [Admin Options](#admin-options)
- [Extending the Theme](#extending-the-theme)

---

## Getting Started

### Requirements

- WordPress 6.0+
- PHP 8.0+
- Node.js 18+

### Installation

```bash
cd wp-content/themes/wp-figmakit
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
├── style.css                  # Theme metadata header (no styles)
├── vite.config.js             # Vite build configuration
├── package.json               # Dependencies (sass, vite)
│
├── inc/                       # PHP modules
│   ├── assets.php             # Vite integration & asset loading
│   ├── blocks.php             # Block registration & auto-discovery
│   ├── admin.php              # Options page, CSP, code injection
│   ├── security.php           # Security hardening
│   ├── templates.php          # Menus & widget areas
│   ├── patterns.php           # Block pattern registration
│   ├── figma-tokens.php       # Figma token → theme.json merging
│   ├── grid-api.php           # Grid settings REST API
│   ├── colors-api.php         # Color tokens REST API
│   ├── policies-api.php       # Block policies REST API
│   ├── block-render-combined.php  # Single-pass block rendering
│   ├── block-attributes.php   # Custom HTML attributes on blocks
│   ├── block-policies.php     # Style class system for blocks
│   ├── button-icons.php       # Button icon injection
│   └── class-fk-header-nav-walker.php  # Custom nav walker
│
├── blocks/                    # Server-side block definitions
│   ├── card/                  # block.json + render.php
│   ├── cta/
│   ├── feature/
│   ├── header/
│   ├── hero/
│   ├── tabs/
│   ├── tab-item/
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
    │   ├── header/
    │   ├── hero/
    │   ├── tabs/
    │   ├── tab-item/
    │   └── testimonial/
    ├── components/            # Editor enhancement components
    │   ├── figmakit-toolbar/  # Custom floating toolbar + panels
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
| `tabs-frontend` | `src/blocks/tabs/tabs-frontend.js` | Tab switching interactivity |

JSX is compiled using WordPress globals (`wp.element.createElement` / `wp.element.Fragment`).

### Asset Loading

- `wp_figmakit_is_vite_dev()` — detects if the dev server is running
- `wp_figmakit_get_manifest()` — reads `dist/.vite/manifest.json`
- `wp_figmakit_enqueue_entry()` — loads entries with HMR or hashed production URLs
- All `wp-figmakit` prefixed scripts are output with `type="module"`

---

## Theme Configuration

### theme.json

The theme uses WordPress Theme JSON v3. See [docs/theme-json.md](docs/theme-json.md) for a detailed guide on how to update it.

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

| Font | Stack |
|------|-------|
| System (default) | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif |
| Monospace | SF Mono, Fira Code, Cascadia Code, monospace |

Font families are registered in `theme.json` and automatically populate the Text Style > Font dropdown in the editor. To add a new font, add an entry to `settings.typography.fontFamilies` in `theme.json`.

**Font Sizes:** small (0.875rem), medium (1rem), large (1.5rem), x-large (2rem), xx-large (3rem)

---

## FigmaKit Toolbar

A custom floating toolbar on the left side of the block editor providing quick access to theme-level settings. It appears in the post/page editor only (hidden in the Site Editor).

The toolbar has five panels, each accessible via an icon button:

### Grid Settings

Controls the global grid/container system. Changes are saved to the database and applied as CSS custom properties.

| Field | Default | CSS Variable |
|-------|---------|--------------|
| Container Max Width | 1440px | `--fk-container-max` |
| Padding (Desktop) | 200px | `--fk-container-padding` |
| Padding (Tablet) | 32px | `--fk-container-padding-tablet` |
| Padding (Mobile) | 24px | `--fk-container-padding-mobile` |
| Gutter (Desktop) | 24px | `--fk-gutter` |
| Gutter (Mobile) | 16px | `--fk-gutter-mobile` |

Updates CSS custom properties live in the editor iframe.

### Colors

Manages theme color tokens with a visual color picker.

**Default colors** (7): Primary, Secondary, Accent, Highlight, Text, Text Light, Background — each with a hex color picker.

**Custom colors**: Add unlimited custom colors with a name and hex value. Custom colors generate CSS variables (e.g. a color named "Brand Blue" becomes `--fk-color-brand-blue`). Colors update live in the editor.

All colors are output as CSS custom properties via `wp_head` on the frontend.

### Patterns

A visual pattern library panel (600px wide, 2-column grid) for managing reusable block patterns.

| Action | Description |
|--------|-------------|
| **Browse** | Visual preview cards using `BlockPreview` |
| **Search** | Filter patterns by name |
| **Insert** | Click a pattern card to insert blocks at cursor position |
| **Save** | Save currently selected blocks as a new reusable pattern |
| **Rename** | Inline rename with Enter to confirm, Escape to cancel |
| **Delete** | Remove patterns with confirmation dialog |

Uses the WordPress `/wp/v2/blocks` REST API (Synced Patterns / Reusable Blocks).

### Block Policies

Define allowed CSS classes per block type. This lets you create a controlled set of style options that content editors can apply to blocks.

**How it works:**
1. In the Policies panel, select a block type (e.g. `core/group`, `core/paragraph`, `core/heading`)
2. Add class/label pairs (e.g. Label: "Card Shadow", Class: `card-shadow`)
3. Save the policies
4. In the editor, each block's inspector panel shows checkboxes for its assigned policy classes

Supports 16+ block types including all custom FigmaKit blocks.

### Portability

Export and import entire page layouts as JSON files.

**Export:** Serializes all page blocks using `wp.blocks.serialize()` and downloads a `.json` file containing the full block markup with all attributes, classes, styles, and nested blocks preserved.

**Import:** Two modes available:
- **Replace** — replaces all page blocks with the imported content
- **Append** — adds imported blocks after existing content

Fully integrated with Gutenberg's undo stack (Ctrl+Z works after import).

---

## Custom Blocks

All blocks are in the `wp-figmakit` category and use server-side rendering via `render.php`. Blocks are auto-discovered from the `blocks/` directory.

### Header (`wp-figmakit/fk-header`)

Site header block with logo, utility navigation, and main navigation.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"default"` | Layout variant |
| `utilityMenuId` | number | `0` | Nav menu term ID for utility nav |
| `mainMenuId` | number | `0` | Nav menu term ID for main nav |
| `showUtilityMenu` | boolean | `true` | Toggle utility menu visibility |
| `showSkipLink` | boolean | `true` | Toggle skip-to-content link |

**Variants:**
- **`default`** — Logo flush left, utility menu and main menu stacked flush right
- **`header-utility-top`** — Utility nav on top row, logo + main nav on bottom row

**Features:**
- Menu items populated from WordPress registered menus via dropdown selector
- Live menu preview in the editor (fetches actual menu items via REST API)
- Logo area uses InnerBlocks (`core/site-logo`, `core/image`, `core/group`)
- Server-side rendering with custom `FK_Header_Nav_Walker` for BEM-style HTML
- Mobile hamburger toggle with animated X, `aria-expanded`, and Escape key handling
- Skip-to-content link for accessibility
- WCAG AA compliant

**Mobile behavior** (< 768px): Hamburger toggle, menus stack vertically (main first, utility below), submenus toggled via tap.

### Card (`wp-figmakit/fk-card`)

Flexible card component with configurable sections.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"vstack"` | Layout variant (Vertical Stack, Horizontal Stack) |
| `showImage` | boolean | `true` | Toggle image section |
| `showEyebrow` | boolean | `true` | Toggle eyebrow text |
| `showButtons` | boolean | `true` | Toggle CTA buttons |
| `showFootnote` | boolean | `false` | Toggle footnote |

Each section (image, eyebrow, title, description, buttons, footnote) uses InnerBlocks so content is fully customizable. The variant control switches between vertical and horizontal card layouts.

### Tabs (`wp-figmakit/fk-tabs`)

Tabbed content container with support for icons, superscripts, and any inner blocks per panel.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"horizontal"` | Tab layout variant |
| `activeTab` | number | `0` | Initially active tab index |

**Tab Item** (`wp-figmakit/fk-tab-item`) — child block:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | `"Tab"` | Tab button label |
| `icon` | string | `""` | Dashicon name |
| `iconMediaId` | number | `0` | Custom icon image ID |
| `iconMediaUrl` | string | `""` | Custom icon image URL |
| `superscript` | string | `""` | Superscript text on tab button |

Each tab panel accepts any blocks as inner content. Tab switching is handled on the frontend via `tabs-frontend.js`.

### Hero (`wp-figmakit/fk-hero`)

Hero/banner section with heading, description, and CTA.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"centered"` | Layout variant |
| `showOverlay` | boolean | `false` | Background overlay |
| `minHeight` | string | `"60vh"` | Minimum section height |
| `showButtons` | boolean | `true` | Toggle CTA buttons |

### Call to Action (`wp-figmakit/fk-cta`)

CTA section with heading, description, and buttons.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"centered"` | Layout variant |
| `alignment` | string | `"center"` | Text alignment |

### Feature (`wp-figmakit/fk-feature`)

Feature block with icon/image, title, and description.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"vstack"` | Layout variant |
| `iconPosition` | string | `"top"` | Icon/image position |

### Testimonial (`wp-figmakit/fk-testimonial`)

Testimonial/quote block with avatar and attribution.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `"standard"` | Layout variant |
| `showAvatar` | boolean | `true` | Toggle avatar |
| `showRole` | boolean | `true` | Toggle role text |

---

## Block Editor Extensions

Every block in the editor gets additional inspector panels injected via WordPress `addFilter()` hooks. These panels appear in the block sidebar and their values are applied as utility classes or inline styles on the frontend via a single-pass `render_block` filter (`inc/block-render-combined.php`).

All extension classes are also applied live in the editor via `editor.BlockListBlock` filters.

### Spacing (`fkSpacing`)

Padding and margin controls with linkable sides for quick uniform values.

**Padding controls:** Top, Bottom, Left, Right — each with a dropdown of spacing scale values.

**Margin controls:** Top, Bottom, Left, Right — same scale plus `auto` for centering.

**Link buttons:** Link all 4 sides, link top/bottom pair, or link left/right pair. When linked, changing one value updates all linked sides.

**Scale values:** 3XL (96px), 2XL (80px), XL (48px), LG (32px), MD (24px), SM (20px), XS (16px), 2XS (12px), 3XS (8px), 4XS (4px), 0

Output as utility classes: `pt-{size}`, `pb-{size}`, `pl-{size}`, `pr-{size}`, `mt-{size}`, `mb-{size}`, `ml-{size}`, `mr-{size}`. Auto-adds `fk-d-block` when both left and right margin are `auto` (horizontal centering).

### Layout (`fkLayout`)

Flexbox, grid, and display controls with responsive overrides.

**Desktop controls:**

| Control | Options |
|---------|---------|
| Display | Block, Flex, Inline Flex, Grid, None |
| Direction | Row, Row Reverse, Column, Column Reverse |
| Justify | Start, Center, End, Space Between, Space Around, Space Evenly |
| Align | Start, Center, End, Stretch, Baseline |
| Wrap | Wrap, No Wrap |
| Gap | 3XL through 4XS, 0 |

**Responsive overrides (Tablet & Mobile):**

| Control | Options |
|---------|---------|
| Display | Block, Flex, None |
| Direction | Row, Column |

**Column management** (for Group blocks): Preset buttons for 1–6 and 12 columns, or a range slider for 1–12. Auto-creates child column blocks with appropriate `fk-col-*` classes.

### Sizing (`fkSizing`)

Width, height, and overflow controls.

| Category | Options |
|----------|---------|
| Width | Auto, 25%, 33%, 50%, 66%, 75%, 100%, 100vw |
| Max Width | None, XS (320px), SM (480px), MD (640px), LG (768px), XL (960px), 2XL (1200px), 3XL (1440px), 100% |
| Height | Auto, 25%, 50%, 75%, 100%, 100vh |
| Min Height | 0, XS (200px), SM (300px), MD (400px), LG (500px), XL (600px), 2XL (800px), 100%, 100vh |
| Max Height | None, 100%, 100vh |
| Overflow | Hidden, Auto, Visible, Scroll |

### Text Style (`fkTextStyle`)

Typography controls for text blocks (Paragraph, Heading, List, Quote, Pullquote, Verse, Preformatted).

**Toolbar dropdown:** Quick text style presets — Title, Subtitle, Eyebrow, Body LG/MD/SM, Caption, Footnote, Link. Each preset applies font size, line height, weight, and letter spacing.

**Inspector panel:**

| Control | Options |
|---------|---------|
| Weight | Light (300), Normal (400), Medium (500), Semibold (600), Bold (700), Black (900) |
| Font | Dynamically populated from `theme.json` font families |
| Color | Primary, Secondary, Accent, Highlight, Text, Text Light, White |

Font family is applied as an inline style using `var(--wp--preset--font-family--{slug})`, so any font added to `theme.json` automatically appears in the dropdown.

### Responsive Visibility (`fkVisibility`)

Show/hide any block per breakpoint with toggle switches.

| Toggle | Hides at | Class Applied |
|--------|----------|---------------|
| Desktop | 1025px+ | `fk-hide-desktop` |
| Tablet | 768px–1024px | `fk-hide-tablet` |
| Mobile | 0–767px | `fk-hide-mobile` |

Shows a warning notice in the editor when a block is hidden on any breakpoint.

### Custom Attributes (`fkAttributes`)

Add arbitrary HTML attributes to any block.

**Supported attributes:** `id`, `class`, `title`, `alt`, `rel`, `target`, `role`, `aria-*`, `data-*`

Add/remove individual attributes with name/value pairs. Applied on the server via `WP_HTML_Tag_Processor`.

### Block Policies / Style Classes (`fkPolicyClasses`)

Checkboxes in the block inspector to toggle predefined CSS classes. Classes are configured per block type in the [Block Policies](#block-policies) toolbar panel.

### Button Icons (`fkButtonIcon`)

Inject Dashicons into `core/button` blocks with configurable position (`before` or `after`).

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

Manageable from the toolbar [Colors](#colors) panel.

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

**Utility classes:** `.p-{size}`, `.m-{size}`, `.py-{size}`, `.px-{size}`, `.pt-{size}`, `.pb-{size}`, `.pl-{size}`, `.pr-{size}`, `.mt-{size}`, `.mb-{size}`, `.ml-{size}`, `.mr-{size}`, `.gap-{size}`, `.gap-x-{size}`, `.gap-y-{size}`

### Typography Scale (`_types.scss`)

| Class | Size | Notes |
|-------|------|-------|
| `.fk-text-title` | 48px | Responsive (36px tablet, 28px mobile) |
| `.fk-text-subtitle` | 32px | Responsive (26px tablet, 22px mobile) |
| `.fk-text-eyebrow` | 12px | Uppercase, tracked |
| `.fk-text-body-lg` | 18px | Responsive (16px mobile) |
| `.fk-text-body-md` | 16px | |
| `.fk-text-body-sm` | 14px | |
| `.fk-text-caption` | 12px | |
| `.fk-text-footnote` | 11px | |
| `.fk-text-link` | 16px | Underlined |

**Font weights:** `.fk-fw-light` (300), `.fk-fw-normal` (400), `.fk-fw-medium` (500), `.fk-fw-semibold` (600), `.fk-fw-bold` (700), `.fk-fw-black` (900)

**Font families:** `.fk-ff-sans`, `.fk-ff-mono`

**Text colors:** `.fk-tc-primary`, `.fk-tc-secondary`, `.fk-tc-accent`, `.fk-tc-highlight`, `.fk-tc-text`, `.fk-tc-text-light`, `.fk-tc-white`

**Text alignment:** `.fk-text-left`, `.fk-text-center`, `.fk-text-right`, `.fk-text-justify` (with responsive variants `.fk-md-text-*`, `.fk-sm-text-*`)

### Breakpoints (`_variables.scss`)

| Breakpoint | Value |
|-----------|-------|
| Desktop min | 1025px |
| Tablet max | 980px |
| Mobile max | 767px |

---

## Grid System

A 12-column responsive grid defined in `_grid.scss`. Container values are configurable from the [Grid Settings](#grid-settings) toolbar panel.

### Container

```html
<div class="fk-container">...</div>
<div class="fk-container-fluid">...</div>
```

### Row & Columns

```html
<div class="fk-row">
    <div class="fk-col-6">Half width</div>
    <div class="fk-col-6">Half width</div>
</div>
```

- **Columns**: `fk-col-1` through `fk-col-12`, `fk-col-auto`, `fk-col` (flex: 1)
- **Tablet**: `fk-col-t-1` through `fk-col-t-12`, `fk-col-t-auto`, `fk-col-t-full`
- **Mobile**: `fk-col-m-1` through `fk-col-m-12`, `fk-col-m-auto`, `fk-col-m-full`
- **No gutter**: `fk-row-no-gutter`

### Offsets

- **Left**: `fk-offset-0` through `fk-offset-11` (responsive: `fk-offset-t-*`, `fk-offset-m-*`)
- **Right**: `fk-offset-r-1` through `fk-offset-r-11`

### Column Order

`fk-order-1` through `fk-order-12`, `fk-order-first`, `fk-order-last` (responsive: `fk-order-t-*`, `fk-order-m-*`)

---

## REST API Endpoints

All endpoints are under the `wp-figmakit/v1` namespace and require authentication.

### Grid Settings

```
GET  /wp-figmakit/v1/grid-settings    # Requires: edit_posts
POST /wp-figmakit/v1/grid-settings    # Requires: manage_options
```

### Color Settings

```
GET  /wp-figmakit/v1/color-settings   # Requires: edit_posts
POST /wp-figmakit/v1/color-settings   # Requires: manage_options
```

### Policies

```
GET  /wp-figmakit/v1/policies         # Requires: edit_posts
POST /wp-figmakit/v1/policies         # Requires: manage_options
```

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
| `sidebar.html` | Sidebar |

### Navigation Menus

- **Primary** — Main site navigation
- **Utility** — Secondary navigation (used by header block)
- **Footer** — Footer navigation

---

## Security

Comprehensive security hardening in `inc/security.php`:

| Feature | Description |
|---------|-------------|
| CORS Restriction | Same-origin only, editors/admins only for REST |
| Security Headers | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Content Security Policy | Configurable CSP with presets for GA, GTM, OneTrust, Facebook, Bing, Clarity, Cloudflare |
| XML-RPC | Disabled |
| Version Hiding | WordPress version removed from headers and feeds |
| File Editing | `DISALLOW_FILE_EDIT` enforced |
| Sensitive Files | Blocks access to license.txt, readme.html, wp-config.php, .htaccess, error_log, debug.log |
| Comment Sanitization | XSS prevention on author, email, URL, and content |
| Secure Cookies | HttpOnly, Secure, SameSite=Lax |
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

### Content Security Policy

Full CSP configuration with per-directive controls and pre-configured defaults for common third-party services.

---

## Data Storage

All theme settings are stored in the `wp_figmakit_options` WordPress option (serialized array). Access via:

```php
$value = wp_figmakit_get_option('grid_container_max', '1440px');
```

---

## Extending the Theme

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
5. Add server-side rendering in `inc/block-render-combined.php`

### Adding a Toolbar Panel

1. Create a panel component in `src/components/figmakit-toolbar/panels/`
2. Add an icon to `icons.jsx`
3. Register in the `PANELS` array in `Toolbar.jsx`

### Adding a Font

Add an entry to `settings.typography.fontFamilies` in `theme.json`:

```json
{
    "fontFamily": "'Inter', sans-serif",
    "slug": "inter",
    "name": "Inter"
}
```

It will automatically appear in the Text Style > Font dropdown. See [docs/theme-json.md](docs/theme-json.md) for more details including loading font files.

### PHP Hooks

| Hook | Type | Description |
|------|------|-------------|
| `render_block` | Filter | Combined class/style injection for all extensions |
| `wp_theme_json_data_theme` | Filter | Figma token merging |
| `send_headers` | Action | Security headers and CSP |
| `wp_head` | Action | Grid CSS vars, color CSS vars, custom head code |
