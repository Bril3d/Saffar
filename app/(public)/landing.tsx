import { router } from 'expo-router';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions
} from 'react-native';

import { AIAssistantCard } from '@/components/AIAssistantCard';
import { Button, Card, Row } from '@/components/app-ui';
import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Timeline, type TimelineStep } from '@/components/Timeline';
import { TrustScore } from '@/components/TrustScore';
import { formatNumber } from '@/constants/locale';
import { colors, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';

/**
 * SAFAR Chain — Public landing page.
 *
 * This is the 30-second elevator pitch made tangible. Judges who land here
 * instantly understand: what the problem is, how the chain works, what the
 * product looks like, and what the AI assistant does.
 */
export default function LandingPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <TopNav isDesktop={isDesktop} />
      <Hero isDesktop={isDesktop} />
      <ProblemStrip isDesktop={isDesktop} />
      <HowItWorks isDesktop={isDesktop} />
      <LiveTraceDemo isDesktop={isDesktop} />
      <AITeaser isDesktop={isDesktop} />
      <RolesGrid isDesktop={isDesktop} />
      <ComplianceBand isDesktop={isDesktop} />
      <TunisiaContext isDesktop={isDesktop} />
      <FinalCta />
      <Footer />
    </ScrollView>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────

function TopNav({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[navStyles.bar, { paddingHorizontal: isDesktop ? 48 : 20 }]}>
      <View style={navStyles.brand}>
        <View style={navStyles.brandGlyph} />
        <Text style={navStyles.brandText}>SAFAR CHAIN</Text>
      </View>
      <View style={navStyles.actions}>
        {isDesktop ? (
          <View style={navStyles.langRow}>
            <Text style={navStyles.langActive}>FR</Text>
            <Text style={navStyles.langMuted}>AR</Text>
            <Text style={navStyles.langMuted}>EN</Text>
          </View>
        ) : null}
        <Pressable onPress={() => router.push('/login')} hitSlop={6}>
          <Text style={navStyles.loginLink}>Se connecter</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/signup')}
          style={navStyles.signupBtn}>
          <Text style={navStyles.signupBtnText}>Commencer  →</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

function Hero({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View
      style={[
        heroStyles.wrap,
        { minHeight: isDesktop ? 640 : 560, paddingHorizontal: isDesktop ? 64 : 24 },
      ]}>
      {/* Background gradient wash — substitute for a full Tunisian photo */}
      <View style={heroStyles.bgWash} pointerEvents="none" />
      <View style={heroStyles.bgVignette} pointerEvents="none" />

      <View style={heroStyles.inner}>
        <View style={[heroStyles.copy, { maxWidth: 640 }]}>
          <View style={heroStyles.eyebrowChip}>
            <Text style={heroStyles.eyebrowFlag}>🇹🇳</Text>
            <Text style={heroStyles.eyebrowText}>Tunisia · Hackathon 2026</Text>
          </View>

          <Text
            style={[
              heroStyles.headline,
              { fontSize: isDesktop ? 64 : 40, lineHeight: isDesktop ? 70 : 46 },
            ]}
            selectable>
            De la ferme à l&apos;assiette.
            {'\n'}
            <Text style={heroStyles.headlineAccent}>
              Vérifié sur la chaîne.
            </Text>
          </Text>

          <Text style={heroStyles.subhead}>
            SAFAR Chain trace chaque antibiotique vétérinaire de la prescription
            jusqu&apos;au consommateur. Conforme OMS AWaRe. Sécurisé par blockchain.
          </Text>

          <View style={[heroStyles.ctaRow, !isDesktop && { flexDirection: 'column' }]}>
            <Button
              variant="cta-large"
              onPress={() => router.push('/signup')}>
              Commencer maintenant
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/sample-traceability')}>
              ▶  Voir une démo
            </Button>
          </View>

          <View style={heroStyles.trustRow}>
            <TrustPill label="Conforme OMS AWaRe" />
            <TrustPill label="100% IA locale" />
            <TrustPill label="Open source" />
          </View>
        </View>

        {isDesktop ? <FloatingProductCard /> : null}
      </View>
    </View>
  );
}

function TrustPill({ label }: { label: string }) {
  return (
    <View style={heroStyles.trustPill}>
      <Text style={heroStyles.trustCheck}>✓</Text>
      <Text style={heroStyles.trustText}>{label}</Text>
    </View>
  );
}

function FloatingProductCard() {
  return (
    <View style={heroStyles.floatingCard}>
      <View style={heroStyles.floatingThumb}>
        <Text style={heroStyles.floatingThumbLabel}>🥩</Text>
      </View>
      <Text style={heroStyles.floatingTitle}>Bœuf de Béja · Élevage El Amri</Text>
      <Text style={heroStyles.floatingSub}>بقري بلدي — باجة</Text>
      <TrustScore score={96} compact showVerifiers={false} />
      <View style={{ height: 8 }} />
      <BlockchainHash
        hash="0xa3f42c190b7e2d45cd98b71ac2fd4b7e2cd98f713b7e2a3f4"
        compact
      />
    </View>
  );
}

// ── Problem strip ──────────────────────────────────────────────────────────

function ProblemStrip({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24 }]}>
      <Text style={sectionStyles.sectionOverline}>Le problème</Text>
      <Text style={sectionStyles.sectionHeadline}>
        La résistance antimicrobienne est une urgence mondiale.
      </Text>
      <View style={[problemStyles.row, !isDesktop && { flexDirection: 'column' }]}>
        <ProblemStat
          value="73%"
          label="des antibiotiques mondiaux utilisés en élevage"
          source="OMS"
        />
        <ProblemStat
          value={`${formatNumber(4.95, 2)}M`}
          label="décès liés à la résistance antimicrobienne en 2019"
          source="The Lancet"
        />
        <ProblemStat
          value="0%"
          label="de traçabilité publique en Tunisie aujourd'hui"
          source="Ce que SAFAR comble"
          accent={colors.accent.saffron}
        />
      </View>
    </View>
  );
}

function ProblemStat({
  value,
  label,
  source,
  accent,
}: {
  value: string;
  label: string;
  source: string;
  accent?: string;
}) {
  return (
    <View style={problemStyles.stat}>
      <Text style={[problemStyles.statValue, accent ? { color: accent } : null]}>
        {value}
      </Text>
      <Text style={problemStyles.statLabel}>{label}</Text>
      <Text style={problemStyles.statSource}>Source · {source}</Text>
    </View>
  );
}

// ── How it works ───────────────────────────────────────────────────────────

const STEPS = [
  {
    role: 'Vétérinaire',
    accent: colors.role.vet,
    title: 'Prescrit avec IA',
    description: 'Symptômes → molécule, ATC, AWaRe, délai.',
    icon: '⚕︎',
  },
  {
    role: 'Pharmacie',
    accent: colors.role.pharmacy,
    title: 'Dispense',
    description: 'Vente enregistrée avec classification AWaRe.',
    icon: '℞',
  },
  {
    role: 'Éleveur',
    accent: colors.role.farmer,
    title: 'Administre',
    description: 'Confirmé hors-ligne, synchronisé au retour réseau.',
    icon: '🐑',
  },
  {
    role: 'Abattoir',
    accent: colors.role.slaughterhouse,
    title: 'Vérifie',
    description: 'Délai de retrait respecté → lot certifié.',
    icon: '✔︎',
  },
  {
    role: 'Consommateur',
    accent: colors.role.consumer,
    title: 'Scanne',
    description: 'Traçabilité complète avant l’achat.',
    icon: '◉',
  },
];

function HowItWorks({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24, backgroundColor: colors.bg.secondary }]}>
      <Text style={sectionStyles.sectionOverline}>Comment ça marche</Text>
      <Text style={sectionStyles.sectionHeadline}>
        De la prescription à l&apos;assiette.
      </Text>
      <View style={[howStyles.row, !isDesktop && { flexDirection: 'column' }]}>
        {STEPS.map((step, i) => (
          <View
            key={step.role}
            style={[
              howStyles.card,
              { borderColor: withAlpha(step.accent, 0.35) },
            ]}>
            <View
              style={[
                howStyles.iconBubble,
                { backgroundColor: withAlpha(step.accent, 0.14), borderColor: withAlpha(step.accent, 0.4) },
              ]}>
              <Text style={[howStyles.icon, { color: step.accent }]}>{step.icon}</Text>
            </View>
            <Text style={[howStyles.roleLabel, { color: step.accent }]}>
              {i + 1}. {step.role}
            </Text>
            <Text style={howStyles.cardTitle}>{step.title}</Text>
            <Text style={howStyles.cardDesc}>{step.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Live traceability demo ─────────────────────────────────────────────────

const DEMO_TIMELINE: TimelineStep[] = [
  {
    title: 'NAISSANCE',
    timestamp: '12 mars 2026 · 08:14',
    actor: 'Élevage El Amri · Béja',
    actorRole: { label: 'Éleveur', accent: colors.role.farmer },
    detail: 'Veau enregistré dans le registre fermier.',
    hash: '0xa3f42c190b7e2d45cd98b71ac2fd4b7e2cd98f713',
    status: 'done',
  },
  {
    title: 'PRESCRIPTION',
    timestamp: '24 mars 2026 · 14:02',
    actor: 'Dr. Sami Ben Ali',
    actorRole: { label: 'Vétérinaire', accent: colors.role.vet },
    detail: 'Amoxicilline — Classe AWaRe Access, retrait 4 jours.',
    hash: '0xdf8f1d2719961c41cc3b7db14a961c9cf040220ea',
    status: 'done',
  },
  {
    title: 'DISPENSATION',
    timestamp: '24 mars 2026 · 17:30',
    actor: 'Pharmacie El Manar · Tunis',
    actorRole: { label: 'Pharmacie', accent: colors.role.pharmacy },
    detail: '120 doses dispensées, lot AMX-04-26.',
    hash: '0x8e4a2b91c12958cfb281a1ad70a2cb0d1c2b6407',
    status: 'done',
  },
  {
    title: 'ADMINISTRATION',
    timestamp: '25 mars 2026 · 06:45',
    actor: 'Élevage El Amri',
    actorRole: { label: 'Éleveur', accent: colors.role.farmer },
    detail: 'Traitement confirmé hors-ligne, synchronisé à 19:22.',
    hash: '0xee2b4a8112b9cefa51ad70a2cb0d1c2b6407c4459',
    status: 'done',
  },
  {
    title: 'RETRAIT VALIDÉ',
    timestamp: '29 mars 2026 · 07:00',
    actor: 'Abattoir Medjez El Bab',
    actorRole: { label: 'Abattoir', accent: colors.role.slaughterhouse },
    detail: 'Délai de retrait respecté, lot certifié.',
    hash: '0x6ec7c26412f9fd20a3a12f5f55d9826a493487c3',
    status: 'done',
  },
  {
    title: 'PUBLIÉ AU MARCHÉ',
    timestamp: '30 mars 2026 · 11:10',
    actor: 'Marketplace SAFAR',
    actorRole: { label: 'Consommateur', accent: colors.role.consumer },
    detail: 'Produit disponible, traçabilité ouverte au public.',
    hash: '0x2e5d8a280c7b551f2dd5ff8f42f59d6823e47f14',
    status: 'active',
  },
];

function LiveTraceDemo({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24 }]}>
      <Text style={sectionStyles.sectionOverline}>Démo interactive</Text>
      <Text style={sectionStyles.sectionHeadline}>
        Voyez la traçabilité en action.
      </Text>
      <View style={[demoStyles.row, !isDesktop && { flexDirection: 'column' }]}>
        <Card variant="default" style={demoStyles.productCard}>
          <View style={demoStyles.productThumb}>
            <Text style={demoStyles.productThumbIcon}>🥩</Text>
          </View>
          <Text style={demoStyles.productTitle}>Bœuf de Béja · Élevage El Amri</Text>
          <Text style={demoStyles.productAr}>بقري بلدي — باجة</Text>
          <Row gap={spacing.sm}>
            <AWaReBadge awareClass="Access" atcCode="J01CA04" size="sm" />
          </Row>
          <Text style={demoStyles.price}>
            42,50 DT <Text style={demoStyles.priceUnit}>/ kg</Text>
          </Text>
          <TrustScore score={96} />
          <Button
            variant="secondary"
            onPress={() => router.push('/sample-traceability')}>
            Scanner un QR de démo
          </Button>
        </Card>

        <Card variant="default" style={demoStyles.timelineCard}>
          <Text style={demoStyles.timelineHeadline}>6 étapes vérifiées on-chain</Text>
          <Timeline steps={DEMO_TIMELINE} />
        </Card>
      </View>
    </View>
  );
}

// ── AI teaser ──────────────────────────────────────────────────────────────

function AITeaser({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24 }]}>
      <Text style={sectionStyles.sectionOverline}>IA vétérinaire</Text>
      <Text style={sectionStyles.sectionHeadline}>
        Assistant IA vétérinaire — 100% local.
      </Text>
      <Text style={sectionStyles.sectionSub}>
        Décrivez les symptômes, recevez molécule, ATC, classification AWaRe et
        délai de retrait. Aucune donnée ne quitte l&apos;appareil. Propulsé par
        Ollama · phi3:mini.
      </Text>
      <View style={{ marginTop: spacing.xl }}>
        <AIAssistantCard autoDemo />
      </View>
    </View>
  );
}

// ── Roles grid ─────────────────────────────────────────────────────────────

const ROLE_CARDS = [
  {
    label: 'Pharmacie',
    accent: colors.role.pharmacy,
    description: 'Dispensation et traçabilité des antibiotiques en temps réel.',
    icon: '℞',
  },
  {
    label: 'Vétérinaire',
    accent: colors.role.vet,
    description: 'Prescriptions intelligentes assistées par IA locale.',
    icon: '⚕︎',
  },
  {
    label: 'Éleveur',
    accent: colors.role.farmer,
    description: 'Lots, retraits et ventes directes aux consommateurs.',
    icon: '🐑',
  },
  {
    label: 'Abattoir',
    accent: colors.role.slaughterhouse,
    description: 'Scan QR pour vérifier l’éligibilité à l’abattage.',
    icon: '✔︎',
  },
  {
    label: 'Consommateur',
    accent: colors.role.consumer,
    description: 'Achat direct avec traçabilité complète du produit.',
    icon: '◉',
  },
  {
    label: 'Régulateur',
    accent: colors.role.regulator,
    description: 'Tableaux de bord agrégés et audit immuable.',
    icon: '🏛',
  },
];

function RolesGrid({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24, backgroundColor: colors.bg.secondary }]}>
      <Text style={sectionStyles.sectionOverline}>La plateforme</Text>
      <Text style={sectionStyles.sectionHeadline}>
        Une plateforme, six acteurs.
      </Text>
      <View style={rolesStyles.grid}>
        {ROLE_CARDS.map((r) => (
          <View
            key={r.label}
            style={[
              rolesStyles.card,
              {
                backgroundColor: withAlpha(r.accent, 0.08),
                borderColor: withAlpha(r.accent, 0.25),
                flexBasis: isDesktop ? '31%' : '47%',
              },
            ]}>
            <View
              style={[
                rolesStyles.iconBubble,
                { backgroundColor: withAlpha(r.accent, 0.14) },
              ]}>
              <Text style={[rolesStyles.icon, { color: r.accent }]}>{r.icon}</Text>
            </View>
            <Text style={rolesStyles.cardTitle}>{r.label}</Text>
            <Text style={rolesStyles.cardDesc}>{r.description}</Text>
            <Text style={[rolesStyles.cardLink, { color: r.accent }]}>En savoir plus →</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Compliance ─────────────────────────────────────────────────────────────

function ComplianceBand({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[complianceStyles.band, { paddingHorizontal: isDesktop ? 64 : 24 }]}>
      <View style={[complianceStyles.row, !isDesktop && { flexDirection: 'column' }]}>
        <ComplianceCell
          icon="🛡"
          title="Conforme OMS AWaRe"
          description="Classification antibiotique standard."
        />
        <ComplianceCell
          icon="⛓"
          title="Blockchain auditable"
          description="Chaque transaction immuable et vérifiable."
        />
        <ComplianceCell
          icon="🇹🇳"
          title="Conçu pour la Tunisie"
          description="Réglementation, langues et marché local."
        />
      </View>
    </View>
  );
}

function ComplianceCell({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={complianceStyles.cell}>
      <Text style={complianceStyles.icon}>{icon}</Text>
      <Text style={complianceStyles.title}>{title}</Text>
      <Text style={complianceStyles.desc}>{description}</Text>
    </View>
  );
}

// ── Tunisia context ────────────────────────────────────────────────────────

function TunisiaContext({ isDesktop }: { isDesktop: boolean }) {
  const points = [
    'Paiement D17 intégré, carte + espèces à la livraison',
    '24 gouvernorats couverts',
    'Interface FR / AR / Darija',
    'Mobile-first pour la connectivité rurale',
    'Offline-first : les éleveurs travaillent même sans réseau',
  ];
  return (
    <View style={[sectionStyles.band, { paddingHorizontal: isDesktop ? 64 : 24 }]}>
      <View style={[tunisiaStyles.row, !isDesktop && { flexDirection: 'column' }]}>
        <View style={tunisiaStyles.photoCol}>
          <View style={tunisiaStyles.photoPlaceholder}>
            <Text style={tunisiaStyles.photoEmoji}>🫒</Text>
            <Text style={tunisiaStyles.photoCaption}>
              Oliveraie de Béja, lumière de fin d&apos;après-midi
            </Text>
          </View>
        </View>
        <View style={tunisiaStyles.copyCol}>
          <Text style={sectionStyles.sectionOverline}>Terroir tunisien</Text>
          <Text style={sectionStyles.sectionHeadline}>
            Construit pour le terroir tunisien.
          </Text>
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {points.map((p) => (
              <View key={p} style={tunisiaStyles.bullet}>
                <Text style={tunisiaStyles.bulletCheck}>✓</Text>
                <Text style={tunisiaStyles.bulletText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <View style={finalStyles.band}>
      <Text style={finalStyles.headline}>Prêt à tracer votre première vente ?</Text>
      <Text style={finalStyles.sub}>
        Créez votre compte en 4 étapes. Vérification manuelle sous 24h.
      </Text>
      <View style={finalStyles.ctas}>
        <Button variant="cta-large" onPress={() => router.push('/signup')}>
          Créer un compte
        </Button>
        <Button variant="ghost" onPress={() => router.push('/login')}>
          J&apos;ai déjà un compte
        </Button>
      </View>
    </View>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <View style={footerStyles.wrap}>
      <View style={footerStyles.row}>
        <View style={footerStyles.col}>
          <Text style={footerStyles.brand}>SAFAR CHAIN</Text>
          <Text style={footerStyles.tagline}>
            De la ferme à l&apos;assiette. Vérifié sur la chaîne.
          </Text>
        </View>
        <View style={footerStyles.col}>
          <Text style={footerStyles.colTitle}>Produit</Text>
          <Text style={footerStyles.link}>Rôles</Text>
          <Text style={footerStyles.link}>Démo</Text>
          <Text style={footerStyles.link}>Pitch deck</Text>
        </View>
        <View style={footerStyles.col}>
          <Text style={footerStyles.colTitle}>Légal</Text>
          <Text style={footerStyles.link}>Conditions</Text>
          <Text style={footerStyles.link}>Confidentialité</Text>
          <Text style={footerStyles.link}>Mentions légales</Text>
        </View>
      </View>
      <View style={footerStyles.bottomStrip}>
        <Text style={footerStyles.bottomText}>
          © 2026 SAFAR Chain · Hackathon Tunisia 2026 · Built with ♥ in Ariana
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
  },
  root: {
    backgroundColor: colors.bg.primary,
    flex: 1,
  },
});

const navStyles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  bar: {
    alignItems: 'center',
    backgroundColor: withAlpha(tokens.canvas, 0.85),
    borderBottomColor: colors.border.subtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 } as object)
      : null),
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandGlyph: {
    backgroundColor: tokens.brandPrimary,
    borderRadius: 2,
    height: 10,
    width: 10,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: `0 0 8px ${tokens.brandGlow}` } as object)
      : null),
  },
  brandText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  langActive: {
    color: colors.accent.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  langMuted: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  langRow: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  loginLink: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  signupBtnText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

const heroStyles = StyleSheet.create({
  bgVignette: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: `radial-gradient(ellipse at top right, ${withAlpha(tokens.accentOchre, 0.12)}, transparent 60%), radial-gradient(ellipse at bottom left, ${withAlpha(tokens.brandPrimary, 0.18)}, transparent 55%)`,
        } as object)
      : { backgroundColor: withAlpha(tokens.brandPrimary, 0.06) }),
  },
  bgWash: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: `linear-gradient(180deg, ${tokens.canvas} 0%, ${withAlpha(tokens.accentTerracotta, 0.05)} 50%, ${tokens.canvas} 100%)`,
        } as object)
      : null),
  },
  copy: {
    flex: 1,
    gap: spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  eyebrowChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(tokens.accentSand, 0.12),
    borderColor: withAlpha(tokens.accentSand, 0.35),
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  eyebrowFlag: {
    fontSize: 13,
  },
  eyebrowText: {
    color: colors.accent.sand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  floatingCard: {
    backgroundColor: withAlpha(tokens.surface1, 0.85),
    borderColor: withAlpha('#FFFFFF', 0.08),
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    marginLeft: 48,
    padding: spacing.xl,
    width: 320,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px)',
          boxShadow: `0 24px 48px rgba(0,0,0,0.4), ${`inset 0 1px 0 rgba(255,255,255,0.06)`}`,
        } as object)
      : null),
  },
  floatingSub: {
    ...typography.caption,
    color: colors.accent.sand,
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  floatingThumb: {
    alignItems: 'center',
    aspectRatio: 16 / 10,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  floatingThumbLabel: {
    fontSize: 40,
  },
  floatingTitle: {
    ...typography.section,
    color: colors.text.primary,
    fontSize: 15,
  },
  headline: {
    color: colors.text.primary,
    fontWeight: '600',
    letterSpacing: -1.2,
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"Cabinet Grotesk", "General Sans", sans-serif' } as object)
      : null),
  },
  headlineAccent: {
    color: colors.accent.sand,
  },
  inner: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 80,
    zIndex: 1,
  },
  subhead: {
    color: colors.text.secondary,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 540,
  },
  trustCheck: {
    color: colors.accent.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  trustPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  trustText: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  wrap: {
    overflow: 'hidden',
    paddingHorizontal: 24,
    position: 'relative',
  },
});

const sectionStyles = StyleSheet.create({
  band: {
    gap: spacing.md,
    paddingHorizontal: 24,
    paddingVertical: 96,
  },
  sectionHeadline: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: 42,
    maxWidth: 640,
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"Cabinet Grotesk", "General Sans", sans-serif' } as object)
      : null),
  },
  sectionOverline: {
    ...typography.overline,
    color: colors.accent.primary,
  },
  sectionSub: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 640,
  },
});

const problemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3xl'],
    marginTop: spacing.xl,
  },
  stat: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 240,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 260,
  },
  statSource: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 10,
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    letterSpacing: -2,
    lineHeight: 80,
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"Cabinet Grotesk", "General Sans", sans-serif' } as object)
      : null),
  },
});

const howStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.primary,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minWidth: 180,
    padding: spacing.xl,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cardTitle: {
    ...typography.section,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  icon: {
    fontSize: 22,
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
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});

const demoStyles = StyleSheet.create({
  price: {
    color: colors.text.primary,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -0.3,
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
    textAlign: 'right',
    ...(Platform.OS === 'web' ? ({ fontFamily: '"IBM Plex Sans Arabic", sans-serif' } as object) : null),
  },
  productCard: {
    flex: 1,
    gap: spacing.md,
    minWidth: 280,
  },
  productThumb: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  productThumbIcon: {
    fontSize: 56,
  },
  productTitle: {
    ...typography.h3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  timelineCard: {
    flex: 2,
    gap: spacing.md,
    minWidth: 320,
  },
  timelineHeadline: {
    ...typography.overline,
    color: colors.accent.blockchain,
  },
});

const rolesStyles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  cardDesc: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
  },
  cardLink: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...typography.section,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});

const complianceStyles = StyleSheet.create({
  band: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 48,
  },
  cell: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
    minWidth: 200,
  },
  desc: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  icon: {
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  title: {
    ...typography.section,
  },
});

const tunisiaStyles = StyleSheet.create({
  bullet: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletCheck: {
    color: colors.accent.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  bulletText: {
    color: colors.text.secondary,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  copyCol: {
    flex: 1,
    gap: spacing.md,
    minWidth: 280,
  },
  photoCaption: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  photoCol: {
    flex: 1,
    minWidth: 280,
  },
  photoEmoji: {
    fontSize: 80,
  },
  photoPlaceholder: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    borderWidth: 1,
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: `linear-gradient(135deg, ${withAlpha(tokens.accentOchre, 0.2)}, ${withAlpha(tokens.brandPrimary, 0.15)})`,
        } as object)
      : null),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3xl'],
  },
});

const finalStyles = StyleSheet.create({
  band: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: 24,
    paddingVertical: 96,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: `linear-gradient(180deg, ${tokens.canvas} 0%, ${withAlpha(tokens.brandPrimary, 0.12)} 50%, ${tokens.canvas} 100%)`,
        } as object)
      : { backgroundColor: withAlpha(tokens.brandPrimary, 0.04) }),
  },
  ctas: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  headline: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: 42,
    maxWidth: 680,
    textAlign: 'center',
    ...(Platform.OS === 'web'
      ? ({ fontFamily: '"Cabinet Grotesk", "General Sans", sans-serif' } as object)
      : null),
  },
  sub: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 520,
    textAlign: 'center',
  },
});

const footerStyles = StyleSheet.create({
  bottomStrip: {
    alignItems: 'center',
    borderTopColor: colors.border.subtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 48,
    paddingTop: spacing.xl,
  },
  bottomText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  brand: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  col: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 200,
  },
  colTitle: {
    ...typography.overline,
    color: colors.text.secondary,
  },
  link: {
    ...typography.body,
    color: colors.text.tertiary,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3xl'],
  },
  tagline: {
    ...typography.caption,
    color: colors.text.tertiary,
    maxWidth: 280,
  },
  wrap: {
    backgroundColor: colors.bg.secondary,
    borderTopColor: colors.border.subtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 48,
    paddingVertical: 64,
  },
});
