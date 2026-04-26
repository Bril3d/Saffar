/**
 * SAFAR Chain — Onboarding / Welcome Screen
 * Premium light design with green accents, blockchain illustration, and feature highlights.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

/* ── Feature Highlight Data ──────────────────────── */

const features = [
  {
    icon: '🔗',
    title: 'Traçabilité complète',
    desc: 'Du médicament à l\'assiette',
  },
  {
    icon: '🛡️',
    title: 'Certifié Blockchain',
    desc: 'Chaque étape vérifiable',
  },
  {
    icon: '🤖',
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
          <Text style={styles.chainEmoji}>🏥</Text>
          <Text style={styles.chainLabel}>Pharmacie</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <Text style={styles.chainEmoji}>🩺</Text>
          <Text style={styles.chainLabel}>Vétérinaire</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <Text style={styles.chainEmoji}>🐄</Text>
          <Text style={styles.chainLabel}>Éleveur</Text>
        </View>
      </View>

      {/* Second row */}
      <View style={styles.chainConnectorVertical} />
      <View style={styles.chainRow}>
        <View style={styles.chainNode}>
          <Text style={styles.chainEmoji}>🔪</Text>
          <Text style={styles.chainLabel}>Abattoir</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={[styles.chainNode, styles.chainNodeHighlight]}>
          <Text style={styles.chainEmoji}>✅</Text>
          <Text style={styles.chainLabel}>Certifié</Text>
        </View>
        <View style={styles.chainLink} />
        <View style={styles.chainNode}>
          <Text style={styles.chainEmoji}>🛒</Text>
          <Text style={styles.chainLabel}>Consommateur</Text>
        </View>
      </View>
    </View>
  );
}

/* ── Feature Card ─────────────────────────────────── */

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Text style={styles.featureIcon}>{icon}</Text>
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
        <Text style={styles.title}>SAFAR Chain</Text>
        <Text style={styles.subtitle}>
          Traçabilité Vétérinaire sur Blockchain
        </Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
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
    backgroundColor: Colors.surfaceContainerLowest,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Illustration
  illustrationContainer: {
    width: width - 48,
    height: 240,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.15,
    top: -40,
    right: -40,
  },
  bgCircleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryFixedDim,
    opacity: 0.12,
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
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  chainNodeHighlight: {
    backgroundColor: Colors.primaryFixed,
  },
  chainEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  chainLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  chainLink: {
    width: 20,
    height: 3,
    backgroundColor: Colors.primaryFixedDim,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  chainConnectorVertical: {
    width: 3,
    height: 12,
    backgroundColor: Colors.primaryFixedDim,
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
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  featureIcon: {
    fontSize: 22,
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
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.full,
    paddingVertical: 18,
    alignItems: 'center',
    ...Shadows.glow(Colors.primaryContainer),
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
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  secondaryLinkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
