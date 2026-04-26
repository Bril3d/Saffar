import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, motion, spacing, tokens, typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { roleHomePath } from '@/types/domain';

/**
 * Root route.
 *  - If authenticated, redirects to the role's home.
 *  - If not, shows a short animated splash (staggered letter fade-in + underline
 *    draw) then redirects to the public landing page.
 */
export default function IndexRoute() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Total splash duration ≈ 1.4s.
    const timer = setTimeout(() => setSplashDone(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (hydrated && splashDone) {
    return <Redirect href={role ? roleHomePath(role) : '/landing'} />;
  }

  return <Splash />;
}

// ── Splash ────────────────────────────────────────────────────────────────

const LETTERS = ['S', 'A', 'F', 'A', 'R', ' ', 'C', 'H', 'A', 'I', 'N'];

function Splash() {
  const letterAnims = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const underline = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger each letter by 40ms.
    const letterAnimations = letterAnims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 280,
        delay: i * motion.stagger,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    Animated.sequence([
      Animated.stagger(0, letterAnimations),
      Animated.parallel([
        Animated.timing(underline, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(tagline, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [letterAnims, tagline, underline]);

  return (
    <View style={styles.root}>
      <View style={styles.wordmarkWrap}>
        <View style={styles.wordmarkRow}>
          {LETTERS.map((letter, i) => (
            <Animated.Text
              key={`${letter}-${i}`}
              style={[
                styles.letter,
                letter === ' ' && { width: 14 },
                {
                  opacity: letterAnims[i],
                  transform: [
                    {
                      translateY: letterAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}>
              {letter}
            </Animated.Text>
          ))}
        </View>

        <Animated.View
          style={[
            styles.underline,
            {
              width: underline.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: tagline,
            transform: [
              {
                translateY: tagline.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}>
        De la ferme à l&apos;assiette. Vérifié sur la chaîne.
      </Animated.Text>

      <View style={styles.footer}>
        <View style={styles.chainGlyph} />
        <Text style={styles.footerText}>Hackathon Tunisia 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chainGlyph: {
    backgroundColor: tokens.brandSecondary,
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  footer: {
    alignItems: 'center',
    bottom: 48,
    flexDirection: 'row',
    gap: spacing.sm,
    position: 'absolute',
  },
  footerText: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 10,
    letterSpacing: 2,
  },
  letter: {
    color: colors.text.primary,
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 6,
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"Cabinet Grotesk", "General Sans", sans-serif' } as object)
      : null),
  },
  root: {
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    letterSpacing: 0.3,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  underline: {
    backgroundColor: colors.accent.primary,
    height: 2,
    marginTop: spacing.sm,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: `0 0 8px ${tokens.brandGlow}` } as object)
      : null),
  },
  wordmarkRow: {
    flexDirection: 'row',
  },
  wordmarkWrap: {
    alignItems: 'flex-start',
  },
});
