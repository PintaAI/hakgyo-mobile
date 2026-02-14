import { useState } from 'react';
import { useAuth } from 'hakgyo-expo-sdk';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ButtonProps } from '@/components/ui/button';

interface SignoutButtonProps extends Omit<ButtonProps, 'onPress'> {
  onSignout?: () => void;
  signoutText?: string;
  loadingText?: string;
}

export function SignoutButton({
  onSignout,
  signoutText = 'Keluar',
  loadingText = 'Loading...',
  ...buttonProps
}: SignoutButtonProps) {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      onSignout?.();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onPress={handleSignout} variant={'destructive'} disabled={isLoading} {...buttonProps}>
      <Text>{isLoading ? loadingText : signoutText}</Text>
    </Button>
  );
}
