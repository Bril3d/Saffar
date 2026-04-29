/**
 * SAFAR Chain — Onboarding / Welcome Screen
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { FileText, Stethoscope, Factory, Search, ShieldCheck, Bot, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/* ── Feature Highlight Data ──────────────────────── */
const features = [
  {
    Icon: Search,
    title: 'Traçabilité complète',
    desc: 'Du médicament à l\'assiette',
  },
  {
    Icon: ShieldCheck,
    title: 'Certifié Blockchain',
    desc: 'Chaque étape vérifiable',
  },
  {
    Icon: Bot,
    title: 'IA Intégrée',
    desc: 'Assistance vétérinaire intelligente',
  },
];

/* ── Blockchain Illustration (SVG-like with Views) ── */
function BlockchainIllustration() {
  return (
    <View style={styles.illustrationContainer}>
      {/* Background circles */}
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />

      {/* Chain nodes */}
      <View style={styles.chainRow}>
        <View style={styles.chainNode}>
          <FileText size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.chainLabel}>Pharmacie</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <Stethoscope size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.chainLabel}>Vétérinaire</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <FileText size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.chainLabel}>Éleveur</Text>
        </View>
      </View>

      {/* Second row */}
      <View style={styles.chainConnectorVertical} />
      <View style={styles.chainRow}>
        <View style={styles.chainNode}>
          <Factory size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.chainLabel}>Abattoir</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={[styles.chainNode, styles.chainNodeHighlight]}>
          <CheckCircle2 size={24} color={Colors.onPrimary} />
          <Text style={[styles.chainLabel, { color: Colors.onPrimary }]}>Certifié</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <FileText size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.chainLabel}>Consommateur</Text>
        </View>
      </View>
    </View>
  );
}

/* ── Feature Card ─────────────────────────────────── */
function FeatureCard({ Icon, title, desc }: { Icon: any; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Icon size={24} color={Colors.primary} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────── */
export default function OnboardingScreen() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role) {
    const routeMap: any = {
      PHARMACY: '/(pharmacy)/home',
      VET: '/(vet)/home',
      FARMER: '/(farmer)/home',
      SLAUGHTERHOUSE: '/(abattoir)/home',
      CONSUMER: '/(consumer)/home',
    };
    return <Redirect href={routeMap[role] || '/(auth)/login'} />;
  }
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Illustration */}
        <BlockchainIllustration />

        {/* Title */}
        <Text style={styles.title}>Farm Care</Text>
        <Text style={styles.subtitle}>
          Traçabilité Vétérinaire sur Blockchain
        </Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {features.map((f, i) => (
            <FeatureCard key={i} Icon={f.Icon} title={f.title} desc={f.desc} />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Commencer</Text>
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          style={styles.secondaryLink}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryLinkText}>
            Déjà inscrit ?{' '}
            <Text style={styles.secondaryLinkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Illustration
  illustrationContainer: {
    width: width - 48,
    height: 240,
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.md,
  },
  bgCircleLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryContainer,
    top: -40,
    right: -40,
  },
  bgCircleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondaryContainer,
    bottom: -20,
    left: -20,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  chainNode: {
    width: 72,
    height: 72,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  chainNodeHighlight: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.glow(Colors.primary),
  },
  chainLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  chainLink: {
    width: 20,
    height: 3,
    backgroundColor: Colors.outline,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  chainConnectorVertical: {
    width: 3,
    height: 12,
    backgroundColor: Colors.outline,
    borderRadius: 2,
    alignSelf: 'center',
  },

  // Title
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },

  // Features
  featuresContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  // Buttons
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: 18,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: 0.3,
  },
  secondaryLink: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  secondaryLinkText: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  secondaryLinkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
