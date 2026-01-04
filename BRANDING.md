# flixy Branding Guidelines

## Brand-Ziel

**"Ich öffne die App und alles ist ruhig, klar und unter Kontrolle."**

flixy soll sich anfühlen wie:
- ✅ vertrauenswürdig
- ✅ modern
- ✅ unaufgeregt
- ✅ professionell ohne steif zu sein

Nicht:
- ❌ aufregend
- ❌ laut
- ❌ verspielt
- ❌ "Startup-hip"

## Brand Personality

Wenn flixy eine Person wäre:
- ruhig
- kompetent
- pragmatisch
- hilft, ohne zu belehren
- sagt nie "Achtung!" ohne guten Grund

## Brand-Attribute

- **Calm** - Ruhig, keine Alarmfarben
- **Clear** - Klarheit vor Cleverness
- **Reliable** - Vertrauenswürdig durch Konsistenz
- **Minimal** - Weniger ist mehr
- **Friendly, not chatty** - Hilfreich ohne zu viel zu erklären

## Design-System

### Farben

**Primärfarben:**
- Hintergrund: `#fafafa` (sehr helles Grau / Off-White)
- Text: `#2d2d2d` (dunkles Grau, nicht schwarz)
- Borders: `#e5e5e5` (sehr helles Grau)

**Akzentfarbe:**
- `#5b7c99` (ruhiges Blau-Grau)
- Verwendung: Primary Buttons, Fokus-Zustände, Positive Bestätigungen

**Status-Farben (ruhig, nicht alarmierend):**
- Success: Akzentfarbe
- Info: `#6b6b6b`
- Warning: `#8b7a5b` (gedeckt)
- Error: `#8b6b6b` (gedecktes Rot, nicht grell)

### Typografie

**Schrift:** Geist Sans (bereits integriert)

**Hierarchie:**
- Headlines: `1.5rem`, `font-weight: 600`, `letter-spacing: -0.01em`
- Body: `0.9375rem`, `line-height: 1.6`
- Meta: `0.8125rem`, `color: var(--text-meta)`

**Regeln:**
- Kein Italic
- Kaum Bold
- Großzügige Zeilenhöhen

### Spacing

- Großzügige Abstände zwischen Elementen
- Luft = Vertrauen
- Sections: `3rem` Abstand
- Components: `1.5rem` Abstand

### UI-Elemente

**Buttons:**
- Primary: Akzentfarbe, weißer Text
- Secondary: Transparent, Border, Text-Farbe
- Keine Schatten, klare Borders

**Cards:**
- Borders statt Schatten
- `border: 1px solid var(--border-default)`
- Subtle Variante: `background: var(--background)`

**Status Badges:**
- Ruhige Hintergrundfarben
- Gedeckte Textfarben
- Keine Alarmfarben

## Logo

**Wordmark:** `flixy` (Kleinbuchstaben)
- Leichte Rundungen durch Geist Sans
- Keine Effekte
- Unterordnet sich dem Design, dominiert nicht

## Sprache & Microcopy

**Grundsatz:** Klar > clever

**Gute Beispiele:**
- "Rechnung erstellen"
- "Rechnung fertigstellen"
- "Als bezahlt markieren"
- "Später senden"

**Schlechte Beispiele:**
- "Dokument generieren"
- "Finalisieren"
- "Transaktion buchen"
- "Posting durchführen"

**Tone-of-Voice:**
- Kein Marketing-Sprech
- Keine Buchhalter-Wörter
- Direkt und hilfreich
- Erklärt nur, wenn nötig

## UI-Prinzipien

1. **Wenig visuelle Hierarchie** - Nicht alles ist wichtig
2. **Großzügige Abstände** - Luft = Vertrauen
3. **Keine Schatten-Orgien** - Borders statt Cards mit Depth
4. **Status ist ruhig** - Keine Alarmfarben
5. **Primäre Aktion eindeutig** - Max. 1 pro Screen

## Branding North-Star

**"flixy fühlt sich nie stressig an."**

Wenn:
- ein Screen stressig wirkt → zu viel
- ein Button schreit → zu laut
- ein Text erklärt → zu kompliziert

Dann ist es nicht flixy.

## CSS-Variablen

Alle Brand-Farben sind als CSS-Variablen definiert in `app/globals.css`:

```css
--background: #fafafa
--foreground: #2d2d2d
--border: #e5e5e5
--accent: #5b7c99
--accent-hover: #4a6b85
--text-primary: #2d2d2d
--text-secondary: #6b6b6b
--text-meta: #9b9b9b
```

## Verwendung

- Verwende CSS-Variablen statt Hardcoded-Farben
- Nutze die `.card`, `.btn-primary`, `.btn-secondary` Klassen
- Verwende `.text-headline`, `.text-body`, `.text-meta` für Typografie
- Status-Badges: `.status-badge` mit Modifiern (`.success`, `.info`, `.warning`, `.error`)

