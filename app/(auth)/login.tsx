import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, PageHeader, Screen, TextField } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { ACTORS, roleHomePath, ROLES, type Role } from '@/types/domain';

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>('FARMER');
  const [email, setEmail] = useState('demo@safar.local');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const submit = async () => {
    setLoading(true);
    await login({ email, password, role: selectedRole });
    setLoading(false);
    router.replace(roleHomePath(selectedRole));
  };

  return (
    <Screen>
      <View style={styles.brandContainer}>
        <Text style={styles.brand}>SAFAR</Text>
        <Text style={styles.brandSub}>CHAIN</Text>
      </View>

      <PageHeader
        title="Connexion"
        subtitle="Selectionnez votre role et identifiez-vous pour acceder a la plateforme."
      />

      <View style={styles.roles}>
        {ROLES.map((role) => {
          const actor = ACTORS[role];
          const selected = selectedRole === role;

          return (
            <Pressable
              key={role}
              onPress={() => setSelectedRole(role)}
              style={[
                styles.roleCard,
                selected && { backgroundColor: actor.accentBg, borderColor: actor.accent },
              ]}>
              <View style={[styles.roleAccent, { backgroundColor: actor.accent }]} />
              <View style={styles.roleContent}>
                <Text style={[styles.roleLabel, selected && { color: colors.text.primary }]}>
                  {actor.label}
                </Text>
                <Text style={styles.roleDescription}>{actor.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formSection}>
        <TextField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Adresse email"
          onChangeText={setEmail}
          placeholder="votre@email.com"
          value={email}
        />
        <TextField
          label="Mot de passe"
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Minimum 8 caracteres"
          value={password}
        />
        <Button disabled={loading || !email || !password} onPress={submit}>
          Se connecter
        </Button>
        {loading ? <ActivityIndicator color={colors.accent.primary} /> : null}
        <Button variant="ghost" onPress={() => undefined}>
          Creer un compte
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  brand: {
    color: colors.accent.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 4,
  },
  brandSub: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 2,
  },
  formSection: {
    gap: spacing.lg,
  },
  roleAccent: {
    borderRadius: radii.full,
    height: 8,
    marginTop: 4,
    width: 8,
  },
  roleCard: {
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  roleContent: {
    flex: 1,
    gap: spacing.xs,
  },
  roleDescription: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  roleLabel: {
    ...typography.section,
    color: colors.text.secondary,
    fontSize: 15,
  },
  roles: {
    gap: spacing.sm,
  },
});
