import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, PageHeader, PrimaryButton, Screen, SecondaryButton, TextField } from '@/components/app-ui';
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
      <PageHeader
        eyebrow="Safar mobile"
        subtitle="Choisissez un acteur. Le role est stocke au login et chaque navigateur acteur est protege par RoleGuard."
        title="Connexion"
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
                { borderLeftColor: selected ? actor.accent : '#cbd5e1' },
                selected ? styles.roleCardSelected : undefined,
              ]}>
              <Text style={styles.roleLabel}>{actor.label}</Text>
              <Text style={styles.roleDescription}>{actor.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card tone="green">
        <TextField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          value={email}
        />
        <TextField
          label="Mot de passe"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <PrimaryButton disabled={loading || !email || !password} onPress={submit}>
          Se connecter
        </PrimaryButton>
        {loading ? <ActivityIndicator color="#166534" /> : null}
        <SecondaryButton onPress={() => undefined}>Creer un compte</SecondaryButton>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roleCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderLeftWidth: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  roleCardSelected: {
    backgroundColor: '#f0fdf4',
  },
  roleDescription: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  roleLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  roles: {
    gap: 10,
  },
});
