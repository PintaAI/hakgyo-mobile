# Daily Login Popup Usage Guide

This guide explains how to use the daily login popup feature in the hakgyo app.

## Overview

The daily login popup appears when a user logs in for the first time each day. It displays:
- Welcome message
- XP gained from daily login bonus
- Current streak information
- Milestone achievements (if any)
- Current level

## Components

### 1. `useDailyLogin` Hook

Location: [`hooks/use-daily-login.ts`](../hooks/use-daily-login.ts)

This hook automatically processes the daily login event and manages the popup state.

**Returns:**
```typescript
{
  showPopup: boolean;           // Whether to show the popup
  dailyLoginData: DailyLoginData | null;  // Data for the popup
  dismissPopup: () => void;     // Function to dismiss the popup
}
```

**DailyLoginData Interface:**
```typescript
interface DailyLoginData {
  xpGained: number;              // XP gained from daily login
  currentStreak: number;         // Current streak in days
  streakMilestoneReached: boolean; // Whether a milestone was reached
  level?: number;               // User's current level
}
```

### 2. `DailyLoginPopup` Component

Location: [`components/daily-login-popup.tsx`](../components/daily-login-popup.tsx)

A modal popup component that displays the daily login information.

**Props:**
```typescript
interface DailyLoginPopupProps {
  visible: boolean;              // Whether the popup is visible
  onClose: () => void;          // Callback when popup is closed
  data: DailyLoginData;         // Data to display in the popup
}
```

## Usage Example

### Basic Usage in a Screen Component

```tsx
import { useDailyLogin } from '@/hooks/use-daily-login';
import { DailyLoginPopup } from '@/components/daily-login-popup';
import { View } from 'react-native';

export default function HomeScreen() {
  const { showPopup, dailyLoginData, dismissPopup } = useDailyLogin();

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      {/* Daily Login Popup */}
      {dailyLoginData && (
        <DailyLoginPopup
          visible={showPopup}
          onClose={dismissPopup}
          data={dailyLoginData}
        />
      )}
    </View>
  );
}
```

### Usage in Root Layout

For the popup to appear on any screen, you can place it in the root layout:

```tsx
// app/_layout.tsx
import { useDailyLogin } from '@/hooks/use-daily-login';
import { DailyLoginPopup } from '@/components/daily-login-popup';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const { showPopup, dailyLoginData, dismissPopup } = useDailyLogin();

  return (
    <>
      <Stack>
        {/* Your stack screens */}
      </Stack>
      
      {/* Daily Login Popup */}
      {dailyLoginData && (
        <DailyLoginPopup
          visible={showPopup}
          onClose={dismissPopup}
          data={dailyLoginData}
        />
      )}
    </>
  );
}
```

### Usage in Tab Layout

```tsx
// app/(tabs)/_layout.tsx
import { useDailyLogin } from '@/hooks/use-daily-login';
import { DailyLoginPopup } from '@/components/daily-login-popup';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { showPopup, dailyLoginData, dismissPopup } = useDailyLogin();

  return (
    <>
      <Tabs>
        {/* Your tab screens */}
      </Tabs>
      
      {/* Daily Login Popup */}
      {dailyLoginData && (
        <DailyLoginPopup
          visible={showPopup}
          onClose={dismissPopup}
          data={dailyLoginData}
        />
      )}
    </>
  );
}
```

## Features

### Automatic Daily Login Processing
- The hook automatically processes the daily login event when the user opens the app
- Uses AsyncStorage to track the last login date per user
- Only triggers once per day per user

### XP and Streak Tracking
- Awards XP for daily login (configured in the gamification SDK)
- Tracks and displays current streak
- Shows milestone achievements when reached

### Animated Popup
- Smooth fade and zoom animations
- Backdrop press to dismiss
- "Continue Learning" button to close

### Responsive Design
- Uses NativeWind for styling
- Adapts to different screen sizes
- Follows app design system with semantic color tokens

## Customization

### Styling
The popup uses the app's design system. To customize:
- Modify colors in the component using NativeWind classes
- Adjust animations in the `Animated` components
- Change icons from `lucide-react-native`

### Behavior
- The popup appears automatically after successful daily login
- It only shows once per day per user
- The `dismissPopup` function can be called programmatically to close it

## Technical Details

### Storage
- Uses `@react-native-async-storage/async-storage` to track last login date
- Storage key format: `daily_login_last_date_{userEmail}`

### API Integration
- Uses `gamificationApi.processEvent()` from `hakgyo-expo-sdk`
- Event type: `DAILY_LOGIN`
- Returns XP, streak, and milestone data

### Dependencies
- `react-native-reanimated` for animations
- `lucide-react-native` for icons
- `@rn-primitives` for UI components
