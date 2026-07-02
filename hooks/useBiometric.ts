import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { loginUser } from '../firebase/authService';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_PASSWORD_KEY = 'biometric_password';

interface UseBiometricReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  authenticate: () => Promise<boolean>;
  enable: (email: string, password: string) => Promise<void>;
  disable: () => Promise<void>;
}

export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(hasHardware && isEnrolled);

      const stored = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(stored === 'true');
    })();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to FrameFinder',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Retrieve stored credentials and log in
      const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);
      if (email && password) {
        await loginUser(email, password);
        return true;
      }
    }
    return false;
  }, []);

  const enable = useCallback(
    async (email: string, password: string): Promise<void> => {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
      await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
      setIsEnabled(true);
    },
    []
  );

  const disable = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY);
    setIsEnabled(false);
  }, []);

  return { isAvailable, isEnabled, authenticate, enable, disable };
}
