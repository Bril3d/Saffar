/**
 * SAFAR Chain — Login Screen
 * 5 role selector cards + email/password + green pill CTA.
 * "Emerald Trace" design: white bg, green primary, tonal layering, no borders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useAuth, Role } from '@/store/authStore';

/* ── Role Data ───────────────────────────────────── */

const roles: { id: Role; icon: string; label: string }[] = [
  { id: 'PHARMACY', icon: '🏥', label: 'Pharmacie' },
  { id: 'VET', icon: '🩺', label: 'Vétérinaire' },
  { id: 'FARMER', icon: '🐄', label: 'Éleveur' },
  { id: 'SLAUGHTERHOUSE', icon: '🔪', label: 'Abattoir' },
  { id: 'CONSUMER', icon: '🛒', label: 'Consommateur' },
];

/* ── Role Card ───────────────────────────────────── */

function RoleCard({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {selected && (
        <View style={styles.roleCheckBadge}>
          <Text style={styles.roleCheckText}>✓</Text>
        </View>
      )}
      <Text style={styles.roleIcon}>{icon}</Text>
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function LoginScreen() {
  const { login, selectRole, selectedRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!selectedRole) {
      setError('Veuillez sélectionner votre rôle');
      return;
    }
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    try {
      await login(selectedRole, email, password);

      // Navigate to the correct actor home
      const routeMap: Record<Role, string> = {
        PHARMACY: '/(pharmacy)/home',
        VET: '/(vet)/home',
        FARMER: '/(farmer)/home',
        SLAUGHTERHOUSE: '/(abattoir)/home',
        CONSUMER: '/(consumer)/home',
      };
      router.replace(routeMap[selectedRole] as any);
    } catch {
      setError('Échec de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoChain}>🔗</Text>
            <Text style={styles.logoText}>SAFAR Chain</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

          {/* Role Selector */}
          <Text style={styles.sectionLabel}>Sélectionnez votre rôle</Text>
          <View style={styles.rolesGrid}>
            {roles.map((r) => (
              <RoleCard
                key={r.id}
                icon={r.icon}
                label={r.label}
                selected={selectedRole === r.id}
                onPress={() => selectRole(r.id)}
              />
            ))}
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.outline}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={Colors.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordBtn}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7}>
            <Text style={styles.ghostButtonText}>Créer un compte</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Traçabilité certifiée blockchain 🔗
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoChain: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  // Title
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  // Roles grid (2 columns + 1 centered)
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  roleCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 90,
  },
  roleCardSelected: {
    backgroundColor: Colors.primaryFixed,
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckText: {
    fontSize: 11,
    color: Colors.onPrimary,
    fontWeight: '800',
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  roleLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Error
  errorContainer: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: Colors.onErrorContainer,
    fontWeight: '500',
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 56,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  showPasswordBtn: {
    padding: Spacing.xs,
  },
  showPasswordText: {
    fontSize: 18,
  },

  // Buttons
  primaryButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.full,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.glow(Colors.primaryContainer),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: 0.3,
  },
  ghostButton: {
    borderRadius: Radii.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.outline,
    marginTop: Spacing.xl,
  },
});
