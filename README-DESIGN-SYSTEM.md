# Invoice+ Design System

This application follows a strict design system managed via `src/styles/design-tokens.ts` and reusable components in `src/components/ui/`.

## 🎨 Color System

We use a semantic color palette based on Tailwind's Slate (surfaces), Blue (primary), Emerald (success), Amber (warning), and Red (danger).

- **Primary Action**: `bg-blue-600`
- **Background**: `bg-[#0f172a]` (Slate 900)
- **Cards**: `bg-slate-800` (Slate 800) with `border-slate-700`
- **Text**: `text-slate-100` (Primary), `text-slate-400` (Muted)

## 🧩 Reusable Components

Always use these core components instead of raw HTML:

### Button
```tsx
import { Button } from './ui/Button';

<Button variant="primary" icon={<Plus />}>Add Item</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">View Details</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

<Card hoverEffect>
  <CardHeader>
    <CardTitle>Total Revenue</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Input
```tsx
import { Input } from './ui/Input';

<Input 
  label="Client Name" 
  required 
  placeholder="Enter name"
  error={errors.name}
/>
```

### Badge
```tsx
import { Badge } from './ui/Badge';

<Badge variant="success" label="Paid" dot />
<Badge variant="warning" label="Pending" />
```

### Empty States & Loading
```tsx
import { EmptyState, TableSkeleton, Skeleton } from './ui/States';

if (loading) return <TableSkeleton />;
if (!data) return <EmptyState title="No Records" />;
```

## 📏 Spacing & Layout

- **Grid System**: 8px base unit (`gap-2`, `p-4`, `m-6`).
- **Margins**: `space-y-6` for sections, `space-y-8` for page layouts.
- **Micro-interactions**: Use `hover:scale-[1.01]` for cards and `active:scale-[0.98]` for buttons.

## 📊 Charts

Charts use Recharts with custom `CartesianGrid` and semantic colors defined in `design-tokens.ts`. Ensure tooltips use the standard dark theme style.
