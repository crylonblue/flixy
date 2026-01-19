# Multilanguage Invoice Support Implementation Summary

## Overview
This implementation adds support for English invoices in addition to the existing German invoices. Users can enable English invoice support in settings and choose the language when creating invoices.

## Changes Made

### 1. Database Changes
**File: `supabase/migrations/021_add_language_support.sql`**
- Added `enable_english_invoices` boolean field to `companies` table (default: false)
- Added `language` field to `invoices` table (default: 'de', constrained to 'de' or 'en')
- Added index on `invoices.language` for performance

### 2. TypeScript Types
**File: `types/database.ts`**
- Updated `companies` Row/Insert/Update types to include `enable_english_invoices: boolean`
- Updated `invoices` Row/Insert/Update types to include `language: string`

### 3. Translation Utilities
**File: `lib/invoice-translations.ts` (NEW)**
- Created comprehensive translation system for invoice labels
- Supports German and English translations for:
  - Invoice document labels (invoice, invoice number, dates, etc.)
  - Table headers (description, quantity, unit, price, total)
  - Totals section (net amount, VAT, gross amount)
  - Bank details
  - Contact information
  - Email templates
- Added language-specific date formatting:
  - German: DD.MM.YYYY
  - English: MM/DD/YYYY
- Added language-specific currency formatting:
  - German: 1.234,56 €
  - English: €1,234.56
- Provided helper functions:
  - `getTranslations(language)`: Get all translations for a language
  - `formatDateForLanguage(date, language)`: Format dates appropriately
  - `formatCurrencyForLanguage(amount, language)`: Format currency appropriately
  - `getDefaultEmailSubject(language)`: Get default email subject template
  - `getDefaultEmailBody(language)`: Get default email body template

### 4. Company Settings UI
**File: `components/settings/company-settings.tsx`**
- Added import for `Switch` component
- Added `enable_english_invoices` to component state
- Added "Language" section in the "Invoices" tab with:
  - Toggle switch to enable/disable English invoice support
  - Clear description of what enabling this feature does
- Updated save handler to persist `enable_english_invoices` to database

### 5. Draft Editor UI
**File: `components/drafts/draft-editor.tsx`**
- Added import for `Select` components
- Added `language` state (defaults to invoice language or 'de')
- Added language selector UI that:
  - Only appears when `company.enable_english_invoices` is true
  - Allows selection between German (Deutsch) and English
  - Positioned between date fields and line items
- Updated all save/update/finalize operations to include `language` field

### 6. PDF Generator
**File: `lib/pdf-generator.ts`**
- Added language parameter to `generateInvoicePDF()` function (defaults to 'de')
- Imported translation utilities
- Updated all hardcoded German labels to use translation system:
  - Invoice title ("RECHNUNG" → "INVOICE")
  - Invoice details labels
  - Table headers
  - Totals section labels
  - Bank details labels
  - Contact information labels
  - Footer text
- Updated date formatting to use `formatDateForLanguage()`
- Updated currency formatting to use `formatCurrencyForLanguage()`
- Updated PDF metadata title to use correct language

### 7. Email Templates
**File: `lib/email-templates.ts`**
- Added import for translation utilities
- Updated `formatCurrency()` to accept language parameter
- Updated `formatDate()` to accept language parameter
- Updated `replaceEmailPlaceholders()` to accept language parameter
- Updated `generateEmailSubject()` to:
  - Accept language parameter
  - Use language-specific default if no custom template provided
- Updated `generateEmailBody()` to:
  - Accept language parameter
  - Use language-specific default if no custom template provided

### 8. API Routes - Invoice Finalization
**Files:**
- `app/api/invoices/finalize/route.ts`
- `app/api/v1/drafts/[id]/finalize/route.ts`

Changes:
- Extract language from invoice (defaults to 'de' if not set)
- Pass language parameter to `generateInvoicePDF()`

### 9. API Routes - Invoice Sending
**File: `app/api/v1/invoices/[id]/send/route.ts`**
- Extract language from invoice (defaults to 'de' if not set)
- Pass language parameter to `generateEmailSubject()`
- Pass language parameter to `generateEmailBody()`

## User Flow

### Enabling English Invoices
1. Navigate to Settings → Invoices tab
2. Scroll to "Language" section
3. Toggle "Enable English Invoices" switch
4. Click Save

### Creating an English Invoice
1. Create a new invoice draft
2. If English invoices are enabled, a "Language" section appears
3. Select "English" from the dropdown
4. Complete invoice details as normal
5. Finalize the invoice
6. The generated PDF and emails will be in English

### Creating a German Invoice (Default)
1. Create a new invoice draft
2. If English invoices are enabled, language selector shows (default: German)
3. Keep "Deutsch" selected or don't change it
4. Complete invoice details as normal
5. Finalize the invoice
6. The generated PDF and emails will be in German

## Translation Coverage

### PDF Invoice Labels
- ✅ Invoice title (RECHNUNG / INVOICE)
- ✅ Invoice number label
- ✅ Invoice date label
- ✅ Service date label
- ✅ Table headers (Description, Quantity, Unit, Price, Total)
- ✅ Totals section (Net Amount, VAT, Total Amount)
- ✅ Bank details section
- ✅ Contact information (Phone, Tax Number, VAT ID)
- ✅ Date formatting (DD.MM.YYYY / MM/DD/YYYY)
- ✅ Currency formatting (1.234,56 € / €1,234.56)

### Email Templates
- ✅ Default subject line (Rechnung {number} / Invoice {number})
- ✅ Email greeting (Sehr geehrte Damen und Herren / Dear Sir or Madam)
- ✅ Email body with placeholders
- ✅ Email closing (Mit freundlichen Grüßen / Best regards)
- ✅ Date and currency formatting in placeholders

## Testing Checklist

### Settings
- [ ] Enable English invoices toggle appears in Settings → Invoices tab
- [ ] Toggle can be enabled/disabled
- [ ] Settings save successfully
- [ ] Setting persists after page reload

### Draft Creation
- [ ] When English is disabled, language selector does NOT appear
- [ ] When English is enabled, language selector appears
- [ ] Language selector shows "Deutsch" and "English" options
- [ ] Default language is "Deutsch"
- [ ] Language selection persists when saving draft
- [ ] Language selection persists through finalization

### PDF Generation
- [ ] German invoice PDF shows all labels in German
- [ ] English invoice PDF shows all labels in English
- [ ] Date format is correct for each language (DD.MM.YYYY vs MM/DD/YYYY)
- [ ] Currency format is correct for each language (1.234,56 € vs €1,234.56)
- [ ] All sections use translated labels (title, headers, totals, bank details)

### Email Sending
- [ ] German invoice email uses German default template
- [ ] English invoice email uses English default template
- [ ] Placeholders are replaced with correctly formatted values
- [ ] Custom email templates still work
- [ ] Date and currency formatting in emails matches language

### Edge Cases
- [ ] Existing invoices (created before migration) default to German
- [ ] API still works when language parameter is not provided
- [ ] XRechnung XML generation still works (language doesn't affect XML)
- [ ] Backward compatibility maintained

## Migration Notes

### Existing Invoices
All existing invoices will have `language = 'de'` (German) by default due to the migration setting a default value. This ensures backward compatibility.

### Existing Companies
All existing companies will have `enable_english_invoices = false` by default. Users must explicitly enable the feature in settings.

### API Compatibility
The API routes maintain backward compatibility:
- If `language` field is missing from an invoice, it defaults to 'de'
- PDF generation defaults to German if language is not specified
- Email generation defaults to German if language is not specified

## Files Modified
1. `supabase/migrations/021_add_language_support.sql` (NEW)
2. `types/database.ts`
3. `lib/invoice-translations.ts` (NEW)
4. `lib/pdf-generator.ts`
5. `lib/email-templates.ts`
6. `components/settings/company-settings.tsx`
7. `components/drafts/draft-editor.tsx`
8. `app/api/invoices/finalize/route.ts`
9. `app/api/v1/drafts/[id]/finalize/route.ts`
10. `app/api/v1/invoices/[id]/send/route.ts`

Total: 10 files changed (2 new, 8 modified)

## Git Commit
```
feat: Add multilanguage invoice support (German/English)

- Add database migration to support language field on invoices and companies
- Add enable_english_invoices toggle in company settings
- Add language selector in invoice draft editor when English is enabled
- Create translation utilities for invoice PDF and email templates
- Update PDF generator to use translated labels based on invoice language
- Update email templates to support both German and English
- Support language selection in invoice creation and finalization flow

Resolves TIL-7
```

Branch: `cursor/TIL-7-multilanguage-invoice-support-b05c`
