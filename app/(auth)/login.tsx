/**
 * SAFAR Chain — Login Screen
 */
import React, { useState, useEffect } from 'react';
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
import { router, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useAuth, Role } from '@/store/authStore';
import { FileText, Pill, Stethoscope, Tractor, Factory, ShoppingCart, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

/* ── Role Data ───────────────────────────────────── */
const roles: { id: Role; Icon: any; label: string }[] = [
  { id: 'PHARMACY', Icon: Pill, label: 'Pharmacie' },
  { id: 'VET', Icon: Stethoscope, label: 'Vétérinaire' },
  { id: 'FARMER', Icon: Tractor, label: 'Éleveur' },
  { id: 'SLAUGHTERHOUSE', Icon: Factory, label: 'Abattoir' },
  { id: 'CONSUMER', Icon: ShoppingCart, label: 'Consommateur' },
];

/* ── Role Card ───────────────────────────────────── */
function RoleCard({
  Icon,
  label,
  selected,
  onPress,
}: {
  Icon: any;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Icon size={28} color={selected ? Colors.primary : Colors.onSurfaceVariant} style={styles.roleIcon} />
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <View style={styles.roleCheckBadge}>
          <CheckCircle2 size={12} color={Colors.onPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Main Screen ──────────────────────────────────── */
export default function LoginScreen() {
  const { login, register, selectRole, selectedRole, isAuthenticated, role } = useAuth();

  if (isAuthenticated && role) {
    const routeMap: Record<Role, string> = {
      PHARMACY: '/(pharmacy)/home',
      VET: '/(vet)/home',
      FARMER: '/(farmer)/home',
      SLAUGHTERHOUSE: '/(abattoir)/home',
      CONSUMER: '/(consumer)/home',
    };
    return <Redirect href={routeMap[role] as any} />;
  }
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!selectedRole) { setError('Veuillez sélectionner votre rôle'); return; }
    if (!email.trim()) { setError('Veuillez entrer votre email'); return; }
    if (!password.trim()) { setError('Veuillez entrer votre mot de passe'); return; }

    setLoading(true);
    try {
      await login(selectedRole, email, password);
      const routeMap: Record<Role, string> = {
        PHARMACY: '/(pharmacy)/home',
        VET: '/(vet)/home',
        FARMER: '/(farmer)/home',
        SLAUGHTERHOUSE: '/(abattoir)/home',
        CONSUMER: '/(consumer)/home',
      };
      router.replace(routeMap[selectedRole] as any);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!selectedRole) { setError('Veuillez sélectionner votre rôle'); return; }
    if (!name.trim()) { setError('Veuillez entrer votre nom'); return; }
    if (!email.trim()) { setError('Veuillez entrer votre email'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    if (!/[A-Z]/.test(password)) { setError('Le mot de passe doit contenir au moins une majuscule'); return; }
    if (!/[a-z]/.test(password)) { setError('Le mot de passe doit contenir au moins une minuscule'); return; }
    if (!/[0-9]/.test(password)) { setError('Le mot de passe doit contenir au moins un chiffre'); return; }

    setLoading(true);
    try {
      await register(selectedRole, name, email, password);
      const routeMap: Record<Role, string> = {
        PHARMACY: '/(pharmacy)/home',
        VET: '/(vet)/home',
        FARMER: '/(farmer)/home',
        SLAUGHTERHOUSE: '/(abattoir)/home',
        CONSUMER: '/(consumer)/home',
      };
      router.replace(routeMap[selectedRole] as any);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(''); setName(''); setEmail(''); setPassword('');
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
            <FileText size={24} color={Colors.primary} />
            <Text style={styles.logoText}>Farm Care</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isRegister ? 'Créer un compte' : 'Bienvenue'}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister
              ? 'Choisissez votre rôle et créez votre compte'
              : 'Connectez-vous à votre compte'}
          </Text>

          {/* Role Selector */}
          <Text style={styles.sectionLabel}>Sélectionnez votre rôle</Text>
          <View style={styles.rolesGrid}>
            {roles.map((r) => (
              <RoleCard
                key={r.id}
                Icon={r.Icon}
                label={r.label}
                selected={selectedRole === r.id}
                onPress={() => selectRole(r.id)}
              />
            ))}
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formFields}>
            {/* Name Input — register only */}
            {isRegister && (
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.onSurfaceDisabled} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  placeholderTextColor={Colors.onSurfaceDisabled}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.onSurfaceDisabled} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.onSurfaceDisabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.onSurfaceDisabled} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.onSurfaceDisabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.onSurfaceVariant} />
                ) : (
                  <Eye size={20} color={Colors.onSurfaceVariant} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Password hint */}
          {isRegister && (
            <Text style={styles.passwordHint}>
              8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </Text>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={isRegister ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegister ? "S'inscrire" : 'Se connecter'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Register */}
          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.85}
            onPress={toggleMode}
          >
            <Text style={styles.ghostButtonText}>
              {isRegister ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Traçabilité certifiée blockchain 
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
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

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  roleCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 90,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(46, 125, 50, 0.04)',
    borderWidth: 2,
    ...Shadows.glow(Colors.primary),
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    marginBottom: Spacing.sm,
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

  errorContainer: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },

  formFields: {
    gap: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerLow,
  },
  inputIcon: {
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

  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
  ghostButton: {
    borderRadius: Radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.onSurfaceDisabled,
    marginTop: Spacing.xl,
  },
  passwordHint: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
