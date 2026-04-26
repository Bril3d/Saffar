import { router } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
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
import { useAuthStore, getAuthSnapshot } from '@/store/authStore';
import { roleHomePath } from '@/types/domain';

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@safar.local');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const submit = async () => {
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
      await login({ email, password });
      const { role } = getAuthSnapshot();
      if (role) {
        router.replace(roleHomePath(role));
      } else {
        setError('Impossible de déterminer le rôle.');
      }
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
        title="Se connecter"
        subtitle="Identifiez-vous avec votre adresse email ou utilisez la biométrie."
      />

      <View style={styles.formSection}>
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
      </View>
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
});
