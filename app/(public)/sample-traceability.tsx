import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Timeline, type TimelineStep } from '@/components/Timeline';
import { TrustScore } from '@/components/TrustScore';
import {
    Button,
    Card,
    PageHeader,
    Row,
    Screen,
    SectionTitle,
} from '@/components/app-ui';
import { formatPrice } from '@/constants/locale';
import { colors, radii, spacing, typography } from '@/constants/theme';

/**
 * Sample traceability page — accessible without auth.
 * Linked from the landing page "Voir une démo" / "Scanner un QR de démo"
 * buttons so judges can experience the core feature before signing up.
 */

const SAMPLE_TIMELINE: TimelineStep[] = [
  {
    title: 'NAISSANCE',
    timestamp: '12 mars 2026 · 08:14',
    actor: 'Élevage El Amri · Béja',
    actorRole: { label: 'Éleveur', accent: colors.role.farmer },
    detail: 'Veau enregistré, race Brune de l’Atlas, ferme certifiée.',
    hash: '0xa3f42c190b7e2d45cd98b71ac2fd4b7e2cd98f713',
    status: 'done',
  },
  {
    title: 'VISITE VÉTÉRINAIRE',
    timestamp: '23 mars 2026 · 10:30',
    actor: 'Dr. Sami Ben Ali',
    actorRole: { label: 'Vétérinaire', accent: colors.role.vet },
    detail: 'Diagnostic: mammite légère. Traitement Access recommandé.',
    hash: '0xbc213d8f1d2719961c41cc3b7db14a961c9cf040',
    status: 'done',
  },
  {
    title: 'DISPENSATION PHARMACIE',
    timestamp: '24 mars 2026 · 17:30',
    actor: 'Pharmacie El Manar · Tunis',
    actorRole: { label: 'Pharmacie', accent: colors.role.pharmacy },
    detail: 'Amoxicilline lot AMX-04-26 — 120 doses (Access).',
    hash: '0x8e4a2b91c12958cfb281a1ad70a2cb0d1c2b6407',
    status: 'done',
  },
  {
    title: 'ADMINISTRATION FERME',
    timestamp: '25 mars 2026 · 06:45',
    actor: 'Élevage El Amri',
    actorRole: { label: 'Éleveur', accent: colors.role.farmer },
    detail: 'Traitement administré hors-ligne, synchronisé à 19:22.',
    hash: '0xee2b4a8112b9cefa51ad70a2cb0d1c2b6407c4459',
    status: 'done',
  },
  {
    title: 'FIN DE RETRAIT',
    timestamp: '29 mars 2026 · 07:00',
    actor: 'Système SAFAR',
    actorRole: { label: 'Régulateur', accent: colors.role.regulator },
    detail: 'Délai de retrait de 4 jours respecté automatiquement.',
    hash: '0xf01c5d91a7ed70a2cb0d1c2b6407c4459c41cc3b',
    status: 'done',
  },
  {
    title: 'CERTIFICATION ABATTOIR',
    timestamp: '29 mars 2026 · 14:20',
    actor: 'Abattoir Medjez El Bab',
    actorRole: { label: 'Abattoir', accent: colors.role.slaughterhouse },
    detail: 'Scan QR · lot éligible · étiquette imprimée.',
    hash: '0x6ec7c26412f9fd20a3a12f5f55d9826a493487c3',
    status: 'done',
  },
  {
    title: 'PUBLIÉ AU MARCHÉ',
    timestamp: '30 mars 2026 · 11:10',
    actor: 'Marketplace SAFAR',
    actorRole: { label: 'Consommateur', accent: colors.role.consumer },
    detail: 'Produit listé, traçabilité publique.',
    hash: '0x2e5d8a280c7b551f2dd5ff8f42f59d6823e47f14',
    status: 'done',
  },
  {
    title: 'ACHAT',
    timestamp: 'En attente',
    actor: 'Futur consommateur',
    actorRole: { label: 'Consommateur', accent: colors.role.consumer },
    detail: 'Le prochain propriétaire apparaîtra ici.',
    status: 'active',
  },
];

export default function SampleTraceabilityScreen() {
  return (
    <Screen variant="warm">
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.backLabel}>←  Retour</Text>
      </Pressable>

      <PageHeader
        eyebrow="DÉMO PUBLIQUE"
        title="Bœuf de Béja"
        subtitle="Traçabilité complète du produit — accessible sans inscription."
        role={{ label: 'Consommateur', accent: colors.role.consumer }}
      />

      <Card variant="elevated">
        <View style={styles.productHeader}>
          <View style={styles.productThumb}>
            <Text style={styles.productThumbIcon}>🥩</Text>
          </View>
          <View style={styles.productCopy}>
            <Text style={styles.productTitle}>Bœuf de Béja · Élevage El Amri</Text>
            <Text style={styles.productAr}>بقري بلدي — باجة</Text>
            <Row gap={spacing.sm}>
              <AWaReBadge awareClass="Access" atcCode="J01CA04" size="sm" />
            </Row>
            <Text style={styles.price}>
              {formatPrice(42.5)} <Text style={styles.priceUnit}>/ kg</Text>
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <TrustScore score={96} />
      </Card>

      <Card>
        <BlockchainHash
          label="Certificat"
          hash="0xa3f42c190b7e2d45cd98b71ac2fd4b7e2cd98f713b7e2a3f4"
        />
      </Card>

      <SectionTitle>Parcours complet</SectionTitle>
      <Card>
        <Timeline steps={SAMPLE_TIMELINE} />
      </Card>

      <Card variant="tinted" tone="info">
        <Text style={styles.ctaCopy}>
          Vous êtes éleveur, vétérinaire, pharmacien ou abattoir ?
          {'\n'}Créez votre compte pour commencer à tracer vos produits.
        </Text>
        <Button variant="cta-large" onPress={() => router.push('/signup')}>
          Créer mon compte
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  ctaCopy: {
    ...typography.body,
    color: colors.text.primary,
  },
  price: {
    color: colors.text.primary,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  priceUnit: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '500',
  },
  productAr: {
    color: colors.accent.sand,
    fontSize: 13,
    letterSpacing: 0.3,
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"IBM Plex Sans Arabic", sans-serif' } as object)
      : null),
  },
  productCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  productHeader: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  productThumb: {
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.md,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  productThumbIcon: {
    fontSize: 48,
  },
  productTitle: {
    ...typography.h3,
  },
});
