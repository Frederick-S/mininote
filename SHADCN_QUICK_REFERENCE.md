# shadcn/ui Quick Reference

## 🚀 Adding New Components

```bash
# See all available components
npx shadcn@latest add

# Add specific components
npx shadcn@latest add [component-name]
```

## 📦 Recommended Components for Web Note App

### For Navigation & Layout
```bash
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add resizable
```

### For Tree Structure (Notebooks/Pages)
```bash
npx shadcn@latest add collapsible    # ⭐ Best for tree
npx shadcn@latest add accordion      # Alternative
npx shadcn@latest add context-menu   # Right-click menus
```

### For Editor
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add command        # Slash commands
npx shadcn@latest add menubar
npx shadcn@latest add toolbar
```

### For Dialogs & Modals
```bash
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add sheet          # Slide-out panels
```

### For Feedback
```bash
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add badge
npx shadcn@latest add alert
```

### For Forms (Already Added)
```bash
# Already installed:
# - button
# - input
# - label
# - form

# Additional form components:
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add slider
```

### For Data Display
```bash
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
```

## 🎨 Using Components

### Import Pattern
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card Layout
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Form with Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.string().email('Invalid email'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## 🌳 Tree Structure Example

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Folder, File } from 'lucide-react';
import { useState } from 'react';

function NotebookTree() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 hover:bg-accent p-2 rounded">
        <ChevronRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} />
        <Folder className="h-4 w-4" />
        <span>My Notebook</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 space-y-1">
        <div className="flex items-center gap-2 hover:bg-accent p-2 rounded cursor-pointer">
          <File className="h-4 w-4" />
          <span>Page 1</span>
        </div>
        <div className="flex items-center gap-2 hover:bg-accent p-2 rounded cursor-pointer">
          <File className="h-4 w-4" />
          <span>Page 2</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## 🎨 Theming

### CSS Variables (in src/index.css)
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  /* ... more variables */
}
```

### Using Theme Colors
```tsx
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Primary Button
  </Button>
</div>
```

## 🔧 Utility Functions

### cn() Helper (in src/lib/utils.ts)
```tsx
import { cn } from '@/lib/utils';

// Merge classes conditionally
<div className={cn(
  "base-class",
  isActive && "active-class",
  "another-class"
)} />
```

## 🎯 Icons with Lucide

```tsx
import { 
  User, Mail, Lock, Eye, EyeOff,
  ChevronRight, ChevronDown,
  Folder, File, FileText,
  Plus, Minus, X, Check,
  Search, Settings, Menu,
  Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';

<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

<Loader2 className="h-4 w-4 animate-spin" />
```

## 📱 Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
</div>

<Button className="w-full sm:w-auto">
  Responsive Button
</Button>
```

## 🎭 Dark Mode

```tsx
// Add to your root component
<html className="dark">
  {/* Dark mode automatically applied via CSS variables */}
</html>

// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

## 🔗 Useful Links

- **Component Docs**: https://ui.shadcn.com/docs/components
- **Themes**: https://ui.shadcn.com/themes
- **Examples**: https://ui.shadcn.com/examples
- **Lucide Icons**: https://lucide.dev/icons
- **Radix UI**: https://www.radix-ui.com/primitives

## 💡 Tips

1. **Always use `@/` imports** for cleaner paths
2. **Customize components** - you own the code!
3. **Use `cn()` helper** for conditional classes
4. **Leverage Lucide icons** - 1000+ available
5. **Check Radix docs** for advanced component features
6. **Use Form component** for all forms (automatic validation)
7. **Test accessibility** - components are accessible by default

## 🚨 Common Patterns

### Loading State
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Error Display
```tsx
{error && (
  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
    {error}
  </div>
)}
```

### Success Message
```tsx
{success && (
  <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
    <CheckCircle2 className="h-4 w-4" />
    {success}
  </div>
)}
```

---

**Quick Start**: `npx shadcn@latest add [component]`
**Docs**: https://ui.shadcn.com
