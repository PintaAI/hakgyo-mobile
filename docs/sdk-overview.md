# Hakgyo Expo SDK Overview

The `hakgyo-expo-sdk` is a comprehensive SDK for integrating the Hakgyo webapp authentication and API in Expo applications. It provides authentication management, API clients, and utilities for building educational apps.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Authentication](#authentication)
- [API Modules](#api-modules)
- [Types & Interfaces](#types--interfaces)
- [Error Handling](#error-handling)
- [Utilities](#utilities)

---

## Installation

```bash
bun add hakgyo-expo-sdk
```

---

## Setup

### 1. Initialize the SDK

Create a configuration file (e.g., [`lib/config.ts`](../lib/config.ts)):

```typescript
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getBaseUrl(): string {
  const isDev = __DEV__;
  if (isDev) {
    // Android emulator uses 10.0.2.2 to access host's localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }
  return 'https://hakgyo.vercel.app';
}

export const sdkConfig = {
  baseURL: getBaseUrl(),
  auth: {
    deepLinkScheme: 'hakgyo',
    autoRefresh: true,
    sessionRefreshThreshold: 5 * 60 * 1000, // 5 minutes
  },
  api: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  logging: {
    enabled: __DEV__,
    level: __DEV__ ? 'debug' : 'error',
  },
};
```

### 2. Initialize in App Root

In your [`app/_layout.tsx`](../app/_layout.tsx):

```typescript
import { initSDK, AuthProvider } from 'hakgyo-expo-sdk';
import { sdkConfig } from '@/lib/config';

// Initialize SDK
initSDK(sdkConfig);

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}
```

---

## Authentication

### AuthProvider

Wrap your app with `AuthProvider` to enable authentication context:

```typescript
import { AuthProvider } from 'hakgyo-expo-sdk';

<AuthProvider>
  <YourApp />
</AuthProvider>
```

### useAuth Hook

Access authentication state and methods:

```typescript
import { useAuth } from 'hakgyo-expo-sdk';

function MyComponent() {
  const {
    user,           // Current user object
    session,        // Current session
    isLoading,      // Loading state
    isAuthenticated,// Boolean
    signIn,         // Sign in function
    signUp,         // Sign up function
    signOut,        // Sign out function
  } = useAuth();

  // Example: Sign in
  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Auth Functions

#### `signInWithEmail(email, password)`
Sign in with email and password.

```typescript
const response = await signInWithEmail('user@example.com', 'password');
```

#### `signInWithGoogle()`
Sign in with Google OAuth.

```typescript
const response = await signInWithGoogle();
```

#### `signUpWithEmail(email, password, name)`
Create a new account.

```typescript
const response = await signUpWithEmail('user@example.com', 'password', 'John Doe');
```

#### `signOut()`
Sign out the current user.

```typescript
await signOut();
```

---

## API Modules

The SDK provides typed API clients for all major resources. Import them from the SDK:

```typescript
import { api } from 'hakgyo-expo-sdk';
// Or import specific modules
import { kelasApi, materiApi, vocabularyApi, soalApi, tryoutApi, postsApi, userApi, notificationsApi } from 'hakgyo-expo-sdk';
```

### Kelas API

Manage classes/courses.

```typescript
// List all kelas with pagination
const result = await api.kelas.list({ page: 1, limit: 20 });

// Get specific kelas
const kelas = await api.kelas.get(123);

// Create new kelas
const newKelas = await api.kelas.create({
  title: 'Korean for Beginners',
  description: 'Learn Korean from scratch',
  level: 'BEGINNER',
  type: 'REGULAR',
});

// Update kelas
const updated = await api.kelas.update(123, { title: 'Updated Title' });

// Delete kelas
await api.kelas.delete(123);
```

### Materi API

Manage learning materials within classes.

```typescript
// List materi for a kelas
const materiList = await api.materi.list({ kelasId: 123 });

// Get specific materi
const materi = await api.materi.get(456);

// Create materi
const newMateri = await api.materi.create({
  title: 'Basic Greetings',
  description: 'Learn Korean greetings',
  kelasId: 123,
  order: 1,
});

// Update materi
const updated = await api.materi.update(456, { title: 'Updated Title' });

// Delete materi
await api.materi.delete(456);
```

### Vocabulary API

Manage vocabulary sets and items.

```typescript
// List vocabulary sets
const sets = await api.vocabulary.listSets();

// Get specific set
const set = await api.vocabulary.getSet(1);

// Create vocabulary set
const newSet = await api.vocabulary.createSet({
  title: 'Basic Korean Words',
  description: 'Essential words for beginners',
});

// List vocabulary items
const items = await api.vocabulary.listItems({ collectionId: 1 });

// Get specific item
const item = await api.vocabulary.getItem(1);

// Add vocabulary item
const newItem = await api.vocabulary.addItem(1, {
  korean: '안녕하세요',
  indonesian: 'Halo',
  type: 'WORD',
  pos: 'KATA_BENDA',
});

// Mark item as learned
await api.vocabulary.markLearned(1);
```

### Soal (Questions) API

Manage question collections and practice sessions.

```typescript
// Get question collection
const collection = await api.soal.getCollection(1);

// List collections
const collections = await api.soal.listCollections({ page: 1 });

// Start practice session
const session = await api.soal.practice(1);

// Submit practice answers
const result = await api.soal.submitPractice(session.id, [
  { questionId: 1, answer: 'A' },
  { questionId: 2, answer: 'B' },
]);
```

### Tryout API

Manage tryout exams and participation.

```typescript
// List active tryouts
const tryouts = await api.tryout.listActive();

// Get specific tryout
const tryout = await api.tryout.get(1);

// Participate in tryout
const participant = await api.tryout.participate(1);

// Submit tryout answers
const result = await api.tryout.submit(1, answers);

// Get tryout results
const results = await api.tryout.getResults(1);
```

### Posts API

Manage community posts and comments.

```typescript
// List posts
const posts = await api.posts.list({ page: 1 });

// Get specific post
const post = await api.posts.get(1);

// Create post
const newPost = await api.posts.create({
  title: 'My Learning Journey',
  content: 'I started learning Korean today...',
});

// Like post
await api.posts.like(1);

// Unlike post
await api.posts.unlike(1);

// Get comments
const comments = await api.posts.getComments(1);

// Add comment
await api.posts.addComment(1, 'Great post!');
```

### User API

Manage user profile and data.

```typescript
// Get current user profile
const profile = await api.user.getProfile();

// Update profile
const updated = await api.user.updateProfile({
  name: 'John Doe',
  bio: 'Korean learner',
});

// Get user's classes
const classes = await api.user.getClasses();

// Get tryout results
const results = await api.user.getTryoutResults();

// Register push notification token
await api.user.registerPushToken('push-token-here');
```

### Notifications API

Manage push notifications.

```typescript
// Register push token
await api.notifications.registerToken('push-token-here', 'device-id');

// Unregister push token
await api.notifications.unregisterToken('token-id');
```

---

## Types & Interfaces

### User

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'MURID' | 'GURU' | 'ADMIN';
  currentStreak: number;
  xp: number;
  level: number;
  image?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  accessTier?: 'FREE' | 'PREMIUM' | 'CUSTOM';
}
```

### Kelas

```typescript
interface Kelas {
  id: number;
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnail?: string;
  icon?: string;
  isPaidClass: boolean;
  price?: string;
  discount?: string;
  promoCode?: string;
  isDraft: boolean;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
```

### Materi

```typescript
interface Materi {
  id: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  koleksiSoalId?: number;
  passingScore?: number;
  kelasId: number;
  kelas?: Kelas;
  createdAt: string;
  updatedAt: string;
}
```

### VocabularyItem

```typescript
interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  isLearned: boolean;
  type: 'WORD' | 'SENTENCE' | 'IDIOM';
  pos?: 'KATA_KERJA' | 'KATA_BENDA' | 'KATA_SIFAT' | 'KATA_KETERANGAN';
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  creatorId: string;
  collectionId?: number;
  createdAt: string;
  updatedAt: string;
}
```

### ApiResponse

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Error Handling

The SDK provides custom error classes for different error types:

### HakgyoError

Base error class for all SDK errors.

```typescript
try {
  await api.kelas.get(999);
} catch (error) {
  if (error instanceof HakgyoError) {
    console.error(error.code, error.message);
  }
}
```

### AuthError

Authentication-related errors.

```typescript
import { AuthError } from 'hakgyo-expo-sdk';

try {
  await signIn('invalid@example.com', 'wrong-password');
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Auth failed:', error.message);
  }
}
```

### ApiError

API request errors with status code.

```typescript
import { ApiError } from 'hakgyo-expo-sdk';

try {
  await api.kelas.get(999);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}:`, error.message);
    console.error('Response data:', error.data);
  }
}
```

### NetworkError

Network-related errors.

```typescript
import { NetworkError } from 'hakgyo-expo-sdk';

try {
  await api.kelas.list();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  }
}
```

---

## Utilities

### withRetry

Retry failed requests with exponential backoff.

```typescript
import { withRetry } from 'hakgyo-expo-sdk';

const result = await withRetry(
  () => api.kelas.list(),
  {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}:`, error);
    },
  }
);
```

### Logger

Built-in logging utility.

```typescript
import { logger, LogLevel } from 'hakgyo-expo-sdk';

// Set log level
logger.setLevel(LogLevel.DEBUG);

// Log messages
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### getConfig

Get the current SDK configuration.

```typescript
import { getConfig } from 'hakgyo-expo-sdk';

const config = getConfig();
console.log('Base URL:', config.baseURL);
```

---

## Quick Start Example

```typescript
import { useAuth, api } from 'hakgyo-expo-sdk';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  const loadClasses = async () => {
    const result = await api.kelas.list({ page: 1, limit: 10 });
    if (result.success && result.data) {
      console.log('Classes:', result.data);
    }
  };

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Text>XP: {user?.xp} | Level: {user?.level}</Text>
      <Button title="Load Classes" onPress={loadClasses} />
    </View>
  );
}
```

---

## Environment Configuration

The SDK automatically uses different base URLs based on the environment:

| Environment | Platform | Base URL |
|-------------|----------|----------|
| Development | Android | `http://10.0.2.2:3000` |
| Development | iOS/Web | `http://localhost:3000` |
| Production | All | `https://hakgyo.vercel.app/` |

The `__DEV__` global is used to detect development mode automatically.
