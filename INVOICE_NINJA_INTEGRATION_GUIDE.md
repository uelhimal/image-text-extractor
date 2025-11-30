# Invoice Ninja Integration Guide

## Overview
This guide explains how to integrate Invoice Ninja's invoice creation and editing features into your existing OCR invoice scanner application.

## Architecture

```
User uploads invoice → OCR extracts text → AI parses data → 
User reviews/edits → Save to database → Manage invoices
```

## Libraries Used

### Current Libraries (Already Installed)
- **@supabase/supabase-js** (^2.84.0) - Backend database and authentication
- **tesseract.js** (^6.0.1) - OCR text extraction from images
- **react-hook-form** (^7.61.1) - Form management with validation
- **zod** (^3.25.76) - Schema validation
- **date-fns** (^3.6.0) - Date formatting and manipulation
- **lucide-react** (^0.462.0) - Icons
- **sonner** (^1.7.4) - Toast notifications
- **@tanstack/react-query** (^5.83.0) - Server state management

### Additional Libraries to Install
- **react-to-print** - Generate printable/PDF invoices
- **currency.js** - Accurate currency calculations
- **@radix-ui/react-popover** - Already installed for date pickers

## Database Schema

### Tables Required

#### 1. `clients` table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `invoices` table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  terms TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `invoice_items` table
```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Features Implementation

### 1. Invoice Dashboard
**Location:** `/src/pages/InvoiceDashboard.tsx`

**Features:**
- List all invoices with status, client, amount, dates
- Filter by status (draft, sent, paid, overdue)
- Search by invoice number or client name
- Quick actions: view, edit, duplicate, delete
- Summary cards: total revenue, outstanding, overdue count

**Components:**
- `InvoiceList` - Table/grid of invoices
- `InvoiceFilters` - Status and search filters
- `InvoiceStats` - Summary statistics cards

### 2. Invoice Creation/Editing
**Location:** `/src/pages/InvoiceEditor.tsx`

**Features:**
- Create new invoice or edit existing
- Select/create client
- Add/remove/edit line items dynamically
- Auto-calculate subtotal, discount, tax, total
- Set invoice number, dates, payment terms
- Save as draft or mark as sent
- Pre-fill data from OCR extraction

**Components:**
- `InvoiceForm` - Main form wrapper
- `ClientSelector` - Dropdown with search + create new
- `LineItemsEditor` - Dynamic list of items with add/remove
- `InvoiceCalculations` - Discount, tax, total calculations
- `InvoiceDates` - Date pickers for invoice/due dates

### 3. Client Management
**Location:** `/src/pages/ClientManagement.tsx`

**Features:**
- List all clients
- Create/edit/delete clients
- View client invoice history
- Quick select during invoice creation

**Components:**
- `ClientList` - Table of clients
- `ClientForm` - Modal/drawer for add/edit
- `ClientInvoices` - List of invoices for a client

### 4. Invoice Preview/Print
**Location:** `/src/components/InvoicePreview.tsx`

**Features:**
- Professional invoice template
- Print-ready layout
- Export to PDF
- Email invoice (optional)

**Libraries:**
- `react-to-print` - Handle printing
- Custom CSS for print media queries

## Implementation Steps

### Phase 1: Database Setup (30 min)
1. Create migration for clients, invoices, invoice_items tables
2. Add RLS policies for user data isolation
3. Create database functions for auto-calculations
4. Add triggers for updated_at timestamps

### Phase 2: Core Invoice CRUD (2-3 hours)
1. Install `currency.js` for calculations
2. Create invoice types/interfaces
3. Build `InvoiceEditor` component with form
4. Implement `LineItemsEditor` with dynamic rows
5. Add auto-calculation logic (subtotal → discount → tax → total)
6. Integrate with Supabase for save/update/delete

### Phase 3: Client Management (1-2 hours)
1. Create `ClientManagement` page
2. Build `ClientForm` modal
3. Add client selector to invoice editor
4. Implement client CRUD operations

### Phase 4: Invoice Dashboard (2 hours)
1. Create `InvoiceDashboard` page
2. Build invoice list with filters
3. Add status badges and actions
4. Implement search and filtering
5. Add summary statistics

### Phase 5: Connect OCR to Invoice Editor (1 hour)
1. Add "Create Invoice" button after OCR extraction
2. Pre-fill invoice form with extracted data
3. Map AI-extracted fields to invoice fields
4. Allow user to review and edit before saving

### Phase 6: Invoice Preview & Export (2 hours)
1. Install `react-to-print`
2. Create printable invoice template
3. Add print/export functionality
4. Style for professional appearance

## Data Flow

### OCR to Invoice Creation Flow
```
1. User uploads invoice image
2. Tesseract.js extracts text
3. AI (Gemini) parses structured data
4. Display extracted data in AIInvoiceDisplay
5. [NEW] "Create Invoice" button appears
6. Click → Navigate to InvoiceEditor
7. Form pre-filled with extracted data
8. User reviews/edits
9. Save to database
10. Redirect to invoice detail or dashboard
```

### Invoice Editing Flow
```
1. User navigates to invoice dashboard
2. Clicks "Edit" on an invoice
3. Load invoice data from database
4. Display in InvoiceEditor form
5. User modifies data
6. Auto-calculate totals on change
7. Save updates to database
8. Show success notification
```

## Calculation Logic

### Auto-calculation Formula
```javascript
// For each line item
amount = quantity * unit_price

// Invoice totals
subtotal = sum(all line_items.amount)

if (discount_type === 'percentage') {
  discount_amount = subtotal * (discount_value / 100)
} else {
  discount_amount = discount_value
}

amount_after_discount = subtotal - discount_amount

tax_amount = amount_after_discount * (tax_rate / 100)

total = amount_after_discount + tax_amount
```

## Key Components Architecture

### 1. InvoiceEditor Component Structure
```
InvoiceEditor/
├── Header (invoice number, dates)
├── ClientSelector (select/create client)
├── LineItemsTable
│   ├── LineItemRow (description, qty, price, amount)
│   ├── AddItemButton
│   └── RemoveItemButton
├── InvoiceCalculations
│   ├── Subtotal (read-only)
│   ├── Discount (input: type & value)
│   ├── Tax (input: rate %)
│   └── Total (read-only, bold)
├── NotesSection (terms, notes)
└── Actions (Save Draft, Mark Sent, Cancel)
```

### 2. State Management
- Use `react-hook-form` for form state
- Use `@tanstack/react-query` for server state
- Use `zod` for validation schemas
- Use `currency.js` for accurate money calculations

### 3. Routing Structure
```
/                          → OCR Scanner (existing)
/invoices                  → Invoice Dashboard (new)
/invoices/new              → Create Invoice (new)
/invoices/:id              → Invoice Detail/Preview (new)
/invoices/:id/edit         → Edit Invoice (new)
/clients                   → Client Management (new)
```

## Integration with Existing Code

### Modify: src/pages/Index.tsx
After AI extraction completes, add button to create invoice:

```typescript
// Add after AIInvoiceDisplay
{aiInvoiceData && !isProcessing && (
  <Button 
    onClick={() => navigateToCreateInvoice(aiInvoiceData)}
    className="mt-4"
  >
    Create Invoice from This Data
  </Button>
)}
```

### New: src/utils/invoiceCalculations.ts
Centralized calculation functions:
```typescript
export const calculateLineTotal = (qty: number, price: number) => {
  return currency(price).multiply(qty).value;
};

export const calculateSubtotal = (items: LineItem[]) => {
  return items.reduce((sum, item) => 
    sum + calculateLineTotal(item.quantity, item.unit_price), 0
  );
};

// ... more calculation functions
```

## Authentication & Security

### Required Setup
1. Enable email authentication in Lovable Cloud
2. Create protected routes requiring login
3. RLS policies ensure users only see their data
4. All database operations filtered by user_id

### RLS Policy Examples
```sql
-- Users can only view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own invoices
CREATE POLICY "Users can create own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Testing Checklist

- [ ] Create new invoice from scratch
- [ ] Create invoice from OCR data
- [ ] Edit existing invoice
- [ ] Add/remove line items
- [ ] Calculate totals correctly
- [ ] Create/select clients
- [ ] Filter invoices by status
- [ ] Search invoices
- [ ] Print invoice
- [ ] Delete invoice
- [ ] Duplicate invoice
- [ ] Mark invoice as paid

## Next Steps

1. Review this guide
2. Install additional libraries if needed
3. Create database migrations
4. Build components in phases
5. Test each feature thoroughly
6. Deploy and iterate

## Estimated Timeline
- **Total Development Time:** 12-16 hours
- **Phase 1 (Database):** 30 min
- **Phase 2 (Core CRUD):** 2-3 hours
- **Phase 3 (Clients):** 1-2 hours
- **Phase 4 (Dashboard):** 2 hours
- **Phase 5 (OCR Integration):** 1 hour
- **Phase 6 (Preview/Export):** 2 hours
- **Testing & Polish:** 3-4 hours

## Resources
- Invoice Ninja GitHub: https://github.com/invoiceninja/invoiceninja
- Supabase Docs: https://supabase.com/docs
- React Hook Form: https://react-hook-form.com/
- Currency.js: https://currency.js.org/
