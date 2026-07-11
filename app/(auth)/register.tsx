import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }
    if (!email.trim().includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(email.trim(), password, username.trim());
      // AuthContext will navigate to (tabs) automatically via auth guard
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('email-already-in-use')) {
        setErrors({ email: 'This email is already registered.' });
      } else if (message.includes('invalid-email')) {
        setErrors({ email: 'Invalid email format.' });
      } else {
        Toast.show({ type: 'error', text1: 'Registration Failed', text2: 'Please try again.', position: 'bottom' });
      }
    } finally {
      setIsLoading(false);
    }
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the FrameFinder community.</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              placeholder="Username"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
              }}
            />
            {errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}

            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
            />
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={secureText}
                autoComplete="new-password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
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
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={secureConfirmText}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirmPassword)
                    setErrors((e) => ({ ...e, confirmPassword: undefined }));
                }}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setSecureConfirmText((v) => !v)}
              >
                <Ionicons
                  name={secureConfirmText ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  headerSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  errorBanner: {
    color: Colors.error,
    fontSize: Typography.sm,
    backgroundColor: Colors.errorMuted,
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginBottom: Spacing.md,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
    marginBottom: Spacing.xs,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 14,
  },
  fieldError: {
    color: Colors.error,
    fontSize: Typography.xs,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xxs,
  },
  registerButton: {
    backgroundColor: Colors.accent,
    borderRadius: Spacing.radiusMd,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
