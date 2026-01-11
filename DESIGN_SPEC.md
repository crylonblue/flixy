# Blitzrechnung Landing Page – Design Specification

## Design Philosophy

**Calm, Clear, Minimal.**

The design should feel professional and trustworthy without being cold or corporate. Think of it as a well-organized, quiet workspace — everything has its place, nothing screams for attention.

---

## Brand Personality

- **Professional** but approachable
- **Efficient** without feeling rushed
- **Trustworthy** through simplicity
- **Modern** but not trendy

---

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Off-White | `#f5f5f5` | Page background |
| Dark Gray | `#2d2d2d` | Primary text, primary buttons |
| White | `#ffffff` | Cards, content areas |

### Accent Color

| Color | Hex | Usage |
|-------|-----|-------|
| Muted Blue-Gray | `#5b7c99` | Links, focus states, highlights |
| Accent Hover | `#4a6b85` | Hover states for accent elements |
| Accent Light | `#e8edf2` | Subtle backgrounds, badges |

### Text Hierarchy

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#2d2d2d` | Headlines, body text |
| Secondary | `#6b6b6b` | Subheadings, descriptions |
| Meta | `#9b9b9b` | Captions, timestamps, hints |

### Borders

| Color | Hex | Usage |
|-------|-----|-------|
| Subtle | `#f0f0f0` | Dividers, subtle separations |
| Default | `#e5e5e5` | Card borders, input borders |
| Strong | `#d0d0d0` | Hover states, emphasis |

---

## Typography

### Font Family

**Geist Sans** (or similar clean sans-serif like Inter, SF Pro)

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Headline | 48–64px | 600 | 1.1 |
| Section Headline | 32–40px | 600 | 1.2 |
| Card Title | 20–24px | 600 | 1.3 |
| Body Large | 18px | 400 | 1.6 |
| Body | 15px | 400 | 1.6 |
| Small / Meta | 13px | 400 | 1.5 |

### Typography Guidelines

- Use **negative letter-spacing** (-0.01em to -0.02em) on headlines
- Keep line lengths comfortable (50–75 characters)
- Use generous line height for body text
- Avoid all-caps except for very short labels

---

## Spacing

### Spacing Scale

| Name | Size | Usage |
|------|------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | Related elements |
| md | 16px | Default spacing |
| lg | 24px | Between components |
| xl | 48px | Between sections |
| 2xl | 80px | Major section breaks |
| 3xl | 120px | Hero padding, page margins |

### Guidelines

- Be generous with whitespace — let elements breathe
- Use consistent spacing within sections
- Increase spacing between unrelated elements
- Mobile: reduce horizontal padding, maintain vertical rhythm

---

## Buttons

### Primary Button
- **Background:** Dark gray (`#2d2d2d`)
- **Text:** White
- **Border:** None
- **Border Radius:** 6px
- **Padding:** 10px 20px
- **Hover:** Slightly lighter (`rgba(45,45,45,0.9)`)

### Secondary / Outline Button
- **Background:** Transparent or white
- **Text:** Dark gray
- **Border:** 1px solid `#e5e5e5`
- **Hover:** Light gray background, darker border

### Ghost Button
- **Background:** Transparent
- **Text:** Gray
- **Border:** None
- **Hover:** Light gray background

### Button States
- **Disabled:** 50% opacity, no pointer events
- **Focus:** 2px ring with accent color
- **Active:** Subtle scale down (98%)

---

## Cards & Containers

### Card Style
- **Background:** White
- **Border:** 1px solid `#e5e5e5`
- **Border Radius:** 8–12px
- **Padding:** 24px
- **Shadow:** None or very subtle (prefer borders over shadows)

### Design Note
Prefer **borders over shadows** for a cleaner, flatter appearance. Shadows can be used sparingly for modals or elevated elements.

---

## Forms & Inputs

### Input Fields
- **Background:** White
- **Border:** 1px solid `#e5e5e5`
- **Border Radius:** 6px
- **Padding:** 10px 12px
- **Focus:** Darker border + subtle ring

### Labels
- **Size:** 14px
- **Weight:** 500
- **Color:** Primary text
- **Position:** Above input with 6px gap

---

## Links

- **Color:** Accent blue-gray (`#5b7c99`)
- **Decoration:** None by default
- **Hover:** Underline, slightly darker color

---

## Icons

- **Style:** Outlined, 1.5–2px stroke
- **Size:** 16px (small), 20px (default), 24px (large)
- **Color:** Match surrounding text color
- **Library suggestion:** Lucide, Heroicons, or Feather

---

## Landing Page Sections

### 1. Hero Section
- Large headline (48–64px)
- Subheadline in secondary text color
- Primary CTA button + optional secondary button
- Optional product screenshot or illustration
- Generous vertical padding (120px+)

### 2. Features Section
- 3–4 feature cards in a grid
- Icon + title + short description per feature
- Keep descriptions to 1–2 sentences

### 3. How It Works
- 3 steps with numbers or icons
- Simple illustrations or screenshots
- Clear progression (1 → 2 → 3)

### 4. Social Proof (optional)
- Customer logos or testimonials
- Keep it minimal and credible

### 5. Pricing (if applicable)
- Simple pricing cards
- Highlight recommended plan
- Clear feature comparison

### 6. CTA Section
- Repeat primary call-to-action
- Different background (light accent or subtle gradient)

### 7. Footer
- Logo
- Navigation links
- Legal links (Privacy, Terms)
- Copyright

---

## Visual Guidelines

### Do's ✓
- Use plenty of whitespace
- Keep the design clean and uncluttered
- Use borders instead of shadows
- Maintain consistent spacing
- Use the accent color sparingly
- Keep text readable and well-contrasted

### Don'ts ✗
- Avoid bright, saturated colors
- Don't use heavy drop shadows
- Don't crowd elements together
- Avoid decorative elements without purpose
- Don't use more than 2–3 font weights
- Avoid dark mode (light mode only for this brand)

---

## Responsive Considerations

### Desktop (1200px+)
- Full-width hero with side-by-side content
- 3–4 column feature grids
- Generous margins

### Tablet (768px–1199px)
- Reduce horizontal padding
- 2 column feature grids
- Stack hero content if needed

### Mobile (< 768px)
- Single column layout
- Full-width buttons
- Reduced spacing (but keep it generous)
- Hamburger menu for navigation

---

## Animation & Interaction

- Keep animations subtle and fast (150–200ms)
- Use ease-out timing for most transitions
- Animate opacity and transform, avoid layout shifts
- Consider subtle entrance animations on scroll
- Button hover: slight background change, not dramatic

---

## Summary

The landing page should feel like a breath of fresh air — professional, trustworthy, and easy to navigate. Every element should serve a purpose. When in doubt, simplify.

**Key words:** Calm · Clear · Minimal · Professional · Trustworthy
