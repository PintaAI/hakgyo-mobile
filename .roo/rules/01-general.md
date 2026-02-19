# hakgyo Project Rules

## Project Context
This is a Korean language learning mobile application built with React Native and Expo. The app focuses on vocabulary learning, quizzes, and gamification elements.

## Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks, hakgyo-expo-sdk for auth
- **Icons**: lucide-react-native
- **UI Components**: Custom shadcn/ui-style components using @rn-primitives

## Project-Specific Guidelines

### File Organization
- Components are organized by feature in `components/` directory
- Screen components are in `app/` directory using Expo Router conventions
- Shared UI components are in `components/ui/`
- Feature-specific components are in `components/{feature}/` (e.g., `components/vocab/`, `components/auth/`)
- Mock data is in `data/` directory
- Utility functions are in `lib/` directory

### Available UI Components
Always use existing UI components from `components/ui/` before creating new ones:
- `Avatar`, `AvatarFallback`, `AvatarImage` - User avatars
- `Badge` - Status indicators and labels
- `Button` - Interactive buttons
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Card containers
- `Icon` - Icon wrapper for lucide-react-native icons
- `Input` - Text input fields
- `Text` - Typography
- `Tabs` - Tab navigation
- `Alert` - Alert messages
- `LoadingSpinner` - Loading indicators

### Import Conventions
- Use `@/` alias for imports from project root
- Import components: `import { Component } from '@/components/ui/component'`
- Import utilities: `import { utility } from '@/lib/utility'`
- Use index.ts files for cleaner imports from directories

### Styling with NativeWind
- Always use `className` prop for NativeWind styling
- Use semantic color tokens: `primary`, `secondary`, `muted`, `foreground`, `background`, `border`
- Use responsive sizing: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Use spacing utilities: `p-4`, `gap-3`, `mt-2`, `mb-4`, etc.
- Use flexbox: `flex-row`, `flex-col`, `items-center`, `justify-center`, `justify-between`

### Authentication (hakgyo-expo-sdk)
- Use `useAuth()` hook to access user data
- User object contains: `email`, `level`, `xp`, `currentStreak`
- Use `SignoutButton` from `@/components/auth/signout-button` for sign out

### Navigation (Expo Router)
- Tab navigation is in `app/(tabs)/` directory
- Use `router.push()` for programmatic navigation
- File-based routing: `app/(tabs)/index.tsx`, `app/(tabs)/vocab.tsx`, etc.

### Icons
- Use `lucide-react-native` for icons
- Use the `Icon` wrapper component: `<Icon as={IconName} size={24} className="text-primary" />`

### Component Patterns
- Vocabulary features: Use components from `components/vocab/` (vocab-item, vocab-set, vocab-card)
- Bottom sheets are used for detailed views (vocab-item-bottom-sheet)
- Profile uses Avatar component for user avatar

### Environment Specifics
- Package Manager: bun (preferred over npm/npx)
- Shell: cmd.exe (use `;` for command chaining, not `&&`)
- Operating System: Windows 11
- EAS (Expo Application Services): Installed globally, use `eas` commands directly

### Gamification Elements
- XP system for tracking progress
- Streak tracking for daily engagement
- Achievement system for milestones
- Level progression based on XP

### Mock Data
- Vocabulary data: `data/mock-vocabulary.ts`, `data/mock-vocab-sets.ts`
- Quiz data: `data/mock-soal.ts`
