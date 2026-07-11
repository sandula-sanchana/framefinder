import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import ConfirmModal from '../../components/ConfirmModal';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { isAvailable, isEnabled, authenticate, enable } = useBiometric();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill in all fields.' });
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);

      // Offer biometric enrollment after first successful login
      if (isAvailable && !isEnabled) {
        setShowBiometricModal(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Incorrect email or password.' });
      } else if (message.includes('user-not-found')) {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'No account found with this email.' });
      } else if (message.includes('too-many-requests')) {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Too many attempts. Please try again later.' });
      } else {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Please check your credentials.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticate();
      if (!success) {
        Toast.show({ type: 'error', text1: 'Authentication Error', text2: 'Biometric authentication failed.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Authentication Error', text2: 'Biometric authentication failed.' });
    }
  };

  const handleEnableBiometric = async () => {
    await enable(email.trim(), password);
    setShowBiometricModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.heroSection}>
            <Text style={styles.wordmark}>FrameFinder</Text>
            <Text style={styles.tagline}>Discover. Capture. Share.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Welcome back</Text>

            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={secureText}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setSecureText((v) => !v)}
              >
                <Ionicons
                  name={secureText ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Biometric Login */}
            {isEnabled && isAvailable && (
              <View style={styles.biometricSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="finger-print"
                    size={24}
                    color={Colors.accent}
                    style={{ marginRight: Spacing.sm }}
                  />
                  <Text style={styles.biometricText}>Use Biometrics</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Biometric Enable Modal */}
      <ConfirmModal
        visible={showBiometricModal}
        title="Enable Biometric Login"
        message="Use fingerprint or Face ID to sign in faster next time?"
        confirmLabel="Enable"
        confirmVariant="primary"
        onConfirm={handleEnableBiometric}
        onCancel={() => setShowBiometricModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  wordmark: {
    fontSize: Typography.display,
    fontWeight: Typography.extraBold,
    color: Colors.primary,
    letterSpacing: Typography.tight,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    letterSpacing: Typography.wide,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.errorMuted,
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputFocused: {
    borderColor: Colors.accent,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
    marginBottom: Spacing.sm,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: Colors.accent,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  signInButton: {
    backgroundColor: Colors.accent,
    borderRadius: Spacing.radiusMd,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  biometricSection: {
    marginTop: Spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginHorizontal: Spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    height: 52,
  },
  biometricText: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  footerLink: {
    color: Colors.accent,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
});
