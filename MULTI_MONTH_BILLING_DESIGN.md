# Multi-Month Billing Entry Interface Design

## Overview
A streamlined interface for creating billing entries that span multiple months, useful for long-term projects where revenue is recognized over time.

## Key Features

### 1. **Date Range Selection**
- **Start Month/Year** picker
- **End Month/Year** picker
- Visual calendar view showing selected range
- Auto-calculate number of months

### 2. **Distribution Methods**
Three options for splitting the total amount:

#### Option A: **Even Distribution** (Default)
- Automatically divides total amount equally across all months
- Shows per-month amount in preview

#### Option B: **Custom Amounts**
- Table with editable amount per month
- Auto-calculates remaining balance
- Validation to ensure total matches

#### Option C: **Percentage-Based**
- Specify percentage for each month
- Auto-calculates amounts
- Must total 100%

### 3. **Preview Table**
Real-time preview showing:
- Month/Year
- Amount per month
- Cumulative total
- Status (draft/sent/paid) - can be set per month or globally

### 4. **Bulk Entry Options**
- **Same Invoice Number**: All entries share one invoice number with suffix (e.g., INV-001-01, INV-001-02)
- **Sequential Invoice Numbers**: Auto-generate sequential numbers
- **Custom Pattern**: User-defined numbering pattern

### 5. **Cost & Profit Distribution**
- **Option 1**: Apply same cost/profit ratio to all months
- **Option 2**: Distribute total cost/profit evenly
- **Option 3**: Custom cost/profit per month

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Multi-Month Billing Entry                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Basic Information Section]                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Client: [Dropdown ▼]                            │  │
│  │ Invoice Number: [INV-001] [Auto-generate]        │  │
│  │ Invoice Date: [Date Picker]                      │  │
│  │ Currency: [USD ▼]                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Date Range Section]                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Start: [Month ▼] [Year ▼]  →  End: [Month ▼] [Year ▼] │
│  │ Duration: 6 months                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Amount & Distribution Section]                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Total Amount: [$100,000]                        │  │
│  │                                                  │  │
│  │ Distribution Method:                             │  │
│  │ ○ Even Distribution                              │  │
│  │ ○ Custom Amounts                                 │  │
│  │ ○ Percentage-Based                              │  │
│  │                                                  │  │
│  │ [Preview Table]                                  │  │
│  │ Month      | Amount    | Cumulative | Status   │  │
│  │ Jan 2025   | $16,667   | $16,667    | [▼]      │  │
│  │ Feb 2025   | $16,667   | $33,334    | [▼]      │  │
│  │ ...        | ...       | ...        | ...      │  │
│  │ Total      | $100,000  |            |          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Cost & Profit Section]                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Total Cost: [$70,000]                           │  │
│  │ Total Profit: [$30,000] (auto-calculated)       │  │
│  │                                                  │  │
│  │ Distribution:                                    │  │
│  │ ○ Same ratio for all months                     │  │
│  │ ○ Even distribution                             │  │
│  │ ○ Custom per month                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Additional Options]                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ☑ Apply same collected date to all entries     │  │
│  │ ☐ Set payment reference for all entries         │  │
│  │ ☐ Create as drafts (can edit later)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Action Buttons]                                       │
│  [Cancel]  [Preview All Entries]  [Create All Entries] │
└─────────────────────────────────────────────────────────┘
```

## Component Structure

### Main Component: `MultiMonthBillingDrawer`

```typescript
interface MultiMonthBillingForm {
  // Basic Info
  client: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  
  // Date Range
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  
  // Amount
  totalAmount: number;
  distributionMethod: 'even' | 'custom' | 'percentage';
  
  // Monthly Breakdown
  monthlyBreakdown: MonthlyBilling[];
  
  // Cost & Profit
  totalCost: number;
  costDistribution: 'ratio' | 'even' | 'custom';
  
  // Options
  applyCollectedDate: boolean;
  collectedDate?: string;
  paymentReference?: string;
  createAsDrafts: boolean;
}

interface MonthlyBilling {
  month: string; // YYYY-MM format
  amount: number;
  cost?: number;
  profit?: number;
  status: 'draft' | 'sent' | 'paid';
  invoiceNumber?: string; // If sequential
}
```

## Key Interactions

### 1. **Smart Defaults**
- Auto-fill current month as start
- Suggest 6-month duration based on project type
- Auto-calculate profit (amount - cost)

### 2. **Real-time Validation**
- Total amount must match sum of monthly amounts
- Date range must be valid (end >= start)
- All months must have amounts > 0

### 3. **Preview Mode**
- Before creating, show summary of all entries
- Allow editing individual entries
- Show total count of entries to be created

### 4. **Bulk Creation**
- Create all entries in single API call (if supported)
- Or create sequentially with progress indicator
- Show success/error for each entry

## Implementation Approach

### Option 1: **Single Form with Preview**
- One form, preview table below
- Create all entries at once
- Simpler UX, faster entry

### Option 2: **Step-by-Step Wizard**
- Step 1: Basic info & date range
- Step 2: Amount distribution
- Step 3: Cost & profit
- Step 4: Review & confirm
- Better for complex scenarios

### Option 3: **Hybrid (Recommended)**
- Main form with collapsible sections
- Real-time preview table
- "Advanced Options" drawer for custom distributions
- Best balance of simplicity and flexibility

## Example Use Cases

### Use Case 1: Even Distribution
1. Select client: "ABC Corp"
2. Set date range: Jan 2025 - Jun 2025 (6 months)
3. Enter total amount: $120,000
4. Select "Even Distribution"
5. Preview shows: $20,000 per month
6. Click "Create All Entries"
7. Creates 6 billing entries automatically

### Use Case 2: Milestone-Based
1. Select client: "XYZ Ltd"
2. Set date range: Jan 2025 - Dec 2025 (12 months)
3. Enter total amount: $500,000
4. Select "Custom Amounts"
5. Manually enter amounts per month based on milestones
6. Review preview table
7. Create all entries

### Use Case 3: Percentage-Based
1. Select client: "Project Alpha"
2. Set date range: Q1 2025 (3 months)
3. Enter total: $300,000
4. Select "Percentage-Based"
5. Set: Jan 20%, Feb 30%, Mar 50%
6. Auto-calculates: $60k, $90k, $150k
7. Create entries

## Technical Considerations

### API Endpoints Needed
- `POST /api/construction-billings/bulk` - Create multiple entries (if implemented)
- Or multiple sequential `POST /api/construction-billings` calls (recommended for now)

### Data Structure - Separate Entries Per Month
**Important**: Each month creates a **separate billing entry** in the billings table. This ensures:
- Each billing cycle is tracked independently
- Monthly filtering and reporting works correctly
- Individual entries can be edited/deleted separately
- Recognition month is properly set for each entry

Each entry will have:
- **Unique billing_id** (auto-generated, e.g., `BILL-1234567890-ABC`, `BILL-1234567891-DEF`)
- **Sequential invoice_number** (if using pattern, e.g., `INV-001-01`, `INV-001-02`)
- **Same client** (shared across all entries)
- **Same invoice_date** (original invoice date)
- **Different recognition_month** (one per month: Jan 2025, Feb 2025, etc.)
- **Individual amounts** (split from total, e.g., $20k, $20k, $20k)
- **Individual costs** (split from total cost)
- **Individual profits** (calculated per entry: amount - cost)
- **Individual status** (can be set per month or globally)
- **Same currency** (shared)

### Example: Creating 6-Month Billing
**Input:**
- Client: "ABC Corp"
- Total Amount: $120,000
- Total Cost: $80,000
- Date Range: Jan 2025 - Jun 2025
- Distribution: Even

**Result: Creates 6 separate entries in billings table:**

| billing_id | invoice_number | customer | recognition_month | amount | construction_cost | project_profit |
|------------|----------------|----------|-------------------|-------|-------------------|---------------|
| BILL-001-A | INV-001-01 | ABC Corp | 2025-01-01 | 20000 | 13333.33 | 6666.67 |
| BILL-001-B | INV-001-02 | ABC Corp | 2025-02-01 | 20000 | 13333.33 | 6666.67 |
| BILL-001-C | INV-001-03 | ABC Corp | 2025-03-01 | 20000 | 13333.33 | 6666.67 |
| BILL-001-D | INV-001-04 | ABC Corp | 2025-04-01 | 20000 | 13333.33 | 6666.67 |
| BILL-001-E | INV-001-05 | ABC Corp | 2025-05-01 | 20000 | 13333.33 | 6666.67 |
| BILL-001-F | INV-001-06 | ABC Corp | 2025-06-01 | 20000 | 13333.33 | 6666.67 |

### Benefits of Separate Entries
1. **Monthly Reporting**: Each month appears separately in overview tables
2. **Individual Tracking**: Can update status/collected date per month
3. **Flexibility**: Can edit/delete individual months if needed
4. **Consistency**: Works with existing billing table structure
5. **Filtering**: Monthly filters work correctly

### Error Handling
- If one entry fails, show which ones succeeded
- Allow retry for failed entries
- Option to save partial entries
- Show progress indicator during bulk creation

## Benefits

1. **Time Saving**: Create 12 monthly entries in seconds vs. 12 separate forms
2. **Consistency**: Ensures uniform data across months
3. **Accuracy**: Auto-calculation reduces errors
4. **Flexibility**: Supports various distribution methods
5. **Preview**: See all entries before committing

## Next Steps

1. Create `MultiMonthBillingDrawer` component
2. Add "Multi-Month Entry" button to billing page
3. Implement distribution logic
4. Add preview table component
5. Create bulk API endpoint or sequential creation
6. Add validation and error handling

