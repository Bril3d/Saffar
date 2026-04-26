import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from 'react-native';

import {
    Button,
    PageHeader,
    Screen,
    TextField
} from '@/components/app-ui';
import { isValidEmail } from '@/constants/locale';
import { colors, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { ACTORS, roleHomePath, ROLES, type Role } from '@/types/domain';

// Lineart icons rendered as emoji-style short strings so we don't add any
// icon dependency. (Can be swapped for lucide or phosphor later.)
const ROLE_ICONS: Record<Role, string> = {
  PHARMACY: '℞',
  VET: '⚕︎',
  FARMER: '🐑',
  SLAUGHTERHOUSE: '✔︎',
  CONSUMER: '◉',
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  PHARMACY: 'Dispense et trace les ventes d’antibiotiques.',
  VET: 'Prescrit avec assistance IA locale.',
  FARMER: 'Gère les lots et les ventes directes.',
  SLAUGHTERHOUSE: 'Vérifie l’éligibilité avant abattage.',
  CONSUMER: 'Achat direct avec traçabilité complète.',
};

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 800;
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('demo@safar.local');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  // Slide-in for the form section.
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: selectedRole ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedRole, slide]);

  const submit = async () => {
    if (!selectedRole) {
      setError('Sélectionnez un rôle pour continuer.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Adresse email invalide.');
      return;
    }
    if (password.length < 4) {
      setError('Mot de passe trop court.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ email, password, role: selectedRole });
      router.replace(roleHomePath(selectedRole));
    } catch (e) {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.push('/landing')} hitSlop={8} style={styles.backLink}>
        <Text style={styles.backLinkText}>←  Accueil</Text>
      </Pressable>

      <View style={styles.brandRow}>
        <View style={styles.brandGlyph} />
        <Text style={styles.brandText}>SAFAR CHAIN</Text>
      </View>

      <PageHeader
        eyebrow="CONNEXION"
        title={selectedRole ? `Bon retour, ${ACTORS[selectedRole].label}` : 'Se connecter'}
        subtitle={
          selectedRole
            ? 'Identifiez-vous avec votre email ou utilisez la biométrie.'
            : 'Sélectionnez votre rôle pour continuer.'
        }
      />

      <Text style={styles.stepLabel}>1 · Rôle</Text>
      <View style={[styles.roleGrid, { flexDirection: isWide ? 'row' : 'column' }]}>
        {ROLES.map((role) => {
          const actor = ACTORS[role];
          const selected = selectedRole === role;
          return (
            <Pressable
              key={role}
              onPress={() => {
                setSelectedRole(role);
                setError(null);
              }}
              style={[
                styles.roleCard,
                {
                  flexBasis: isWide ? '31%' : undefined,
                  borderColor: selected ? actor.accent : colors.border.subtle,
                  backgroundColor: selected
                    ? withAlpha(actor.accent, 0.12)
                    : colors.bg.secondary,
                },
              ]}>
              <View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: withAlpha(actor.accent, 0.14),
                    borderColor: withAlpha(actor.accent, 0.3),
                  },
                ]}>
                <Text style={[styles.icon, { color: actor.accent }]}>{ROLE_ICONS[role]}</Text>
              </View>
              <Text style={styles.roleLabel}>{actor.label}</Text>
              <Text style={styles.roleDescription}>{ROLE_DESCRIPTIONS[role]}</Text>
              {selected ? (
                <View style={[styles.checkmark, { backgroundColor: actor.accent }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {selectedRole ? (
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: slide,
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.stepLabel}>2 · Identifiants</Text>

          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Adresse email"
            onChangeText={setEmail}
            placeholder="vous@exemple.tn"
            value={email}
          />

          <Pressable style={styles.biometricRow}>
            <View style={styles.biometricIcon}>
              <Text style={styles.biometricIconText}>⊙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.biometricTitle}>Utiliser Face ID / empreinte</Text>
              <Text style={styles.biometricSub}>
                Connexion instantanée sur cet appareil
              </Text>
            </View>
          </Pressable>

          <TextField
            label="Mot de passe"
            onChangeText={setPassword}
            placeholder="Minimum 8 caractères"
            secureTextEntry
            value={password}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button variant="cta-large" disabled={loading} onPress={submit}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>

          <View style={styles.footerLink}>
            <Text style={styles.footerLinkCopy}>Pas encore inscrit ? </Text>
            <Pressable onPress={() => router.push('/signup')} hitSlop={4}>
              <Text style={styles.footerLinkAction}>S&apos;inscrire</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  biometricIcon: {
    alignItems: 'center',
    backgroundColor: withAlpha(tokens.brandSecondary, 0.14),
    borderColor: withAlpha(tokens.brandSecondary, 0.3),
    borderRadius: radii.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  biometricIconText: {
    color: colors.accent.blockchain,
    fontSize: 22,
    fontWeight: '700',
  },
  biometricRow: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  biometricSub: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  biometricTitle: {
    ...typography.section,
    color: colors.text.primary,
    fontSize: 14,
  },
  brandGlyph: {
    backgroundColor: tokens.brandPrimary,
    borderRadius: 2,
    height: 10,
    width: 10,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  checkmark: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 22,
  },
  checkmarkText: {
    color: '#0A0E12',
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
  },
  footerLink: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  footerLinkAction: {
    color: colors.accent.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  footerLinkCopy: {
    color: colors.text.tertiary,
    fontSize: 13,
  },
  formSection: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  icon: {
    fontSize: 24,
    fontWeight: '700',
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 44,
  },
  roleCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    position: 'relative',
  },
  roleDescription: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  roleGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roleLabel: {
    ...typography.section,
    color: colors.text.primary,
    fontSize: 15,
  },
  stepLabel: {
    ...typography.overline,
    color: colors.accent.primary,
  },
});
