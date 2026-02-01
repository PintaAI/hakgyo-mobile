import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from 'hakgyo-expo-sdk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  className?: string;
}

export function AuthCard({ className }: AuthCardProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    if (!registerEmail || !registerPassword || !registerName) {
      setRegisterError('Please fill in all fields');
      return;
    }

    setRegisterLoading(true);
    try {
      await signUpWithEmail(registerEmail, registerPassword, registerName);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={cn('flex-1 justify-center p-6', className)}>
      <View className="w-full max-w-sm mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="login" className="flex-1">
              <Text>Login</Text>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              <Text>Register</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Email</Text>
              <Input
                placeholder="Enter your email"
                value={loginEmail}
                onChangeText={setLoginEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loginLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">Password</Text>
              <Input
                placeholder="Enter your password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                editable={!loginLoading}
              />
            </View>

            {loginError ? (
              <Text className="text-destructive text-sm">{loginError}</Text>
            ) : null}

            <Button
              onPress={handleLogin}
              disabled={loginLoading}
              className="w-full mt-2">
              <Text>{loginLoading ? 'Signing in...' : 'Sign In'}</Text>
            </Button>
          </TabsContent>

          <TabsContent value="register" className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Name</Text>
              <Input
                placeholder="Enter your name"
                value={registerName}
                onChangeText={setRegisterName}
                editable={!registerLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">Email</Text>
              <Input
                placeholder="Enter your email"
                value={registerEmail}
                onChangeText={setRegisterEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!registerLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">Password</Text>
              <Input
                placeholder="Create a password"
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
                editable={!registerLoading}
              />
            </View>

            {registerError ? (
              <Text className="text-destructive text-sm">{registerError}</Text>
            ) : null}

            <Button
              onPress={handleRegister}
              disabled={registerLoading}
              className="w-full mt-2">
              <Text>{registerLoading ? 'Creating account...' : 'Create Account'}</Text>
            </Button>
          </TabsContent>
        </Tabs>
          </CardContent>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}
