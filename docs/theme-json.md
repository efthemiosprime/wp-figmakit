# theme.json — WordPress Theme Configuration

## What is it?

`theme.json` is WordPress's central configuration file for block themes. It controls the design settings and default styles available in the block editor (Gutenberg). WordPress reads this file to generate CSS custom properties (variables), configure editor panels, and apply global styles.

## File location

```
wp-content/themes/wp-figmakit/theme.json
```

## Where to see it in WordPress

- **Appearance > Editor > Styles** — global colors, typography, and spacing reflect what's defined here
- **Block Editor sidebar** — color palettes, font sizes, and font families shown in block controls come from this file
- **Text Style panel (FigmaKit)** — the Font dropdown pulls its options from the `fontFamilies` defined here
- **Generated CSS** — WordPress auto-generates CSS variables like `--wp--preset--color--primary` from the values in this file

## Structure overview

```
theme.json
├── settings        ← what options are available in the editor
│   ├── color.palette        ← theme color swatches
│   ├── typography.fontFamilies  ← font family dropdown options
│   ├── typography.fontSizes     ← font size presets
│   ├── spacing.units            ← allowed spacing units
│   └── layout                   ← content/wide widths
├── styles          ← default styles applied globally
│   ├── color       ← default background & text color
│   ├── typography  ← default font, size, line-height
│   ├── spacing     ← body padding
│   └── elements    ← styles for links, h1, h2, etc.
├── templateParts   ← registered template parts (header, footer, sidebar)
└── customTemplates ← registered page templates (blank, full-width)
```

## How to update

Edit `theme.json` directly. No build step is needed — WordPress reads it on every page load.

### Add a color to the palette

Add an entry to `settings.color.palette`:

```json
{
    "slug": "success",
    "color": "#22c55e",
    "name": "Success"
}
```

This creates the CSS variable `--wp--preset--color--success` and makes "Success" available in the editor's color picker.

### Add a font family

Add an entry to `settings.typography.fontFamilies`:

```json
{
    "fontFamily": "'Inter', sans-serif",
    "slug": "inter",
    "name": "Inter"
}
```

This creates `--wp--preset--font-family--inter` and adds "Inter" to the FigmaKit Text Style > Font dropdown automatically.

**Note:** You must also load the font files (via `@font-face` in CSS, Google Fonts link, or the `fontFace` property in theme.json). Example using `fontFace`:

```json
{
    "fontFamily": "'Inter', sans-serif",
    "slug": "inter",
    "name": "Inter",
    "fontFace": [
        {
            "fontFamily": "Inter",
            "fontWeight": "400",
            "fontStyle": "normal",
            "src": ["file:./assets/fonts/inter-regular.woff2"]
        },
        {
            "fontFamily": "Inter",
            "fontWeight": "700",
            "fontStyle": "normal",
            "src": ["file:./assets/fonts/inter-bold.woff2"]
        }
    ]
}
```

### Add a font size

Add an entry to `settings.typography.fontSizes`:

```json
{ "slug": "huge", "size": "4rem", "name": "Huge" }
```

### Change default styles

Edit the `styles` section. Values should reference preset CSS variables:

```json
"styles": {
    "color": {
        "background": "var(--wp--preset--color--surface)",
        "text": "var(--wp--preset--color--primary)"
    }
}
```

### Add a template part

Add to `templateParts`:

```json
{
    "name": "hero",
    "title": "Hero",
    "area": "uncategorized"
}
```

Then create the corresponding file at `parts/hero.html`.

## Generated CSS variables

WordPress auto-generates these from `theme.json` settings:

| Setting | CSS Variable Pattern | Example |
|---|---|---|
| Color palette | `--wp--preset--color--{slug}` | `--wp--preset--color--primary` |
| Font families | `--wp--preset--font-family--{slug}` | `--wp--preset--font-family--system` |
| Font sizes | `--wp--preset--font-size--{slug}` | `--wp--preset--font-size--large` |

## Relationship to other files

| File | Role |
|---|---|
| `theme.json` | Defines presets (colors, fonts, sizes) and global styles |
| `src/styles/design-tokens/_colors.scss` | FigmaKit's own CSS variables (`--fk-color-*`) used by utility classes |
| `src/styles/design-tokens/_types.scss` | FigmaKit's typography utility classes (`.fk-text-title`, `.fk-fw-bold`, etc.) |
| `style.css` | Theme metadata header only (name, version, author) — no actual styles |

The `--wp--preset--*` variables (from theme.json) and `--fk-*` variables (from SCSS) are separate systems. Theme.json presets power the block editor's built-in controls. FigmaKit's design tokens power the custom utility classes.

## Reference

- [WordPress theme.json docs](https://developer.wordpress.org/themes/global-settings-and-styles/)
- [theme.json schema](https://schemas.wp.org/trunk/theme.json)
