import { router } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions
} from 'react-native';

import { Button, Card, PageHeader, Screen, TextField } from '@/components/app-ui';
import {
    TUNISIAN_GOVERNORATES,
    isValidEmail,
    isValidTunisianMobile,
} from '@/constants/locale';
import { colors, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { ACTORS, ROLES, roleHomePath, type Role } from '@/types/domain';

// ── Types ──────────────────────────────────────────────────────────────────

type FormState = {
  role: Role | null;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  governorate: string;
  // Role-specific
  orgName: string;
  licenseNumber: string;
  address: string;
  ovtId: string;
  specialization: string;
  cin: string;
  farmType: string;
  livestockCount: string;
  capacity: string;
  deliveryAddress: string;
  dietaryPref: string;
  terms: boolean;
  newsletter: boolean;
};

const INITIAL: FormState = {
  role: null,
  fullName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  governorate: TUNISIAN_GOVERNORATES[0],
  orgName: '',
  licenseNumber: '',
  address: '',
  ovtId: '',
  specialization: '',
  cin: '',
  farmType: '',
  livestockCount: '',
  capacity: '',
  deliveryAddress: '',
  dietaryPref: '',
  terms: false,
  newsletter: false,
};

const ROLE_ICONS: Record<Role, string> = {
  PHARMACY: '℞',
  VET: '⚕︎',
  FARMER: '🐑',
  SLAUGHTERHOUSE: '✔︎',
  CONSUMER: '◉',
};

const ROLE_REQUIREMENTS: Record<Role, string> = {
  PHARMACY: 'Numéro de licence pharmacie + adresse',
  VET: 'Numéro OVT (Ordre des Vétérinaires de Tunisie)',
  FARMER: 'CIN + nom + localisation de la ferme',
  SLAUGHTERHOUSE: 'Numéro d’enregistrement ONAGRI + adresse',
  CONSUMER: 'Juste votre email — prêt en 1 minute',
};

// ── Screen ─────────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const login = useAuthStore((state) => state.login);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const accent = form.role ? ACTORS[form.role].accent : colors.accent.primary;
  const totalSteps = 4;

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.role) return 'Sélectionnez un rôle.';
    }
    if (step === 2) {
      if (form.fullName.trim().length < 2) return 'Nom complet requis.';
      if (!isValidEmail(form.email)) return 'Adresse email invalide.';
      if (!isValidTunisianMobile(form.phone)) return 'Numéro mobile tunisien invalide.';
      if (form.password.length < 6) return 'Mot de passe trop court (6 min).';
      if (form.password !== form.passwordConfirm) return 'Les mots de passe ne correspondent pas.';
    }
    if (step === 3) {
      if (form.role === 'PHARMACY' && !form.orgName) return 'Nom de la pharmacie requis.';
      if (form.role === 'VET' && !form.ovtId) return 'Numéro OVT requis.';
      if (form.role === 'FARMER' && !form.cin) return 'CIN requis.';
      if (form.role === 'SLAUGHTERHOUSE' && !form.orgName) return 'Nom de l’établissement requis.';
    }
    if (step === 4) {
      if (!form.terms) return 'Vous devez accepter les conditions.';
    }
    return null;
  };

  const [error, setError] = useState<string | null>(null);

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < totalSteps) setStep((s) => s + 1);
    else submit();
  };

  const submit = async () => {
    if (!form.role) return;
    setSubmitting(true);
    // Mock 1.2s latency so the post-submit flow feels real.
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  const strength = passwordStrength(form.password);

  if (submitted) {
    return (
      <Screen>
        <ConfirmationCard
          role={form.role}
          email={form.email}
          onLogin={async () => {
            if (form.role) {
              await login({ email: form.email, password: form.password, role: form.role });
              router.replace(roleHomePath(form.role));
            }
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.push('/landing')} hitSlop={8} style={styles.backLink}>
        <Text style={styles.backLinkText}>←  Accueil</Text>
      </Pressable>

      <View style={styles.brandRow}>
        <View style={styles.brandGlyph} />
        <Text style={styles.brandText}>SAFAR CHAIN</Text>
      </View>

      {/* Progress bar — tinted with selected role accent */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: accent,
              ...(Platform.OS === 'web'
                ? ({ boxShadow: `0 0 8px ${withAlpha(accent, 0.6)}` } as object)
                : null),
            },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>Étape {step} / {totalSteps}</Text>

      <PageHeader
        title={stepTitle(step)}
        subtitle={stepSubtitle(step, form.role)}
      />

      {step === 1 ? (
        <Step1Role form={form} update={update} isDesktop={isDesktop} />
      ) : null}
      {step === 2 ? <Step2Identity form={form} update={update} strength={strength} /> : null}
      {step === 3 ? <Step3RoleSpecific form={form} update={update} /> : null}
      {step === 4 ? <Step4Review form={form} update={update} onEdit={setStep} /> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.navRow}>
        {step > 1 ? (
          <Button variant="ghost" onPress={() => setStep((s) => s - 1)}>
            Retour
          </Button>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={{ flex: 1 }}>
          <Button variant="cta-large" disabled={submitting} onPress={next}>
            {submitting
              ? 'Création du compte…'
              : step === totalSteps
                ? 'Créer mon compte'
                : 'Continuer'}
          </Button>
        </View>
      </View>

      <View style={styles.footerLink}>
        <Text style={styles.footerLinkCopy}>Déjà inscrit ? </Text>
        <Pressable onPress={() => router.push('/login')} hitSlop={4}>
          <Text style={styles.footerLinkAction}>Se connecter</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

// ── Step 1 — Role selection ───────────────────────────────────────────────

function Step1Role({
  form,
  update,
  isDesktop,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  isDesktop: boolean;
}) {
  return (
    <View style={[styles.roleGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
      {ROLES.map((role) => {
        const actor = ACTORS[role];
        const selected = form.role === role;
        return (
          <Pressable
            key={role}
            onPress={() => update('role', role)}
            style={[
              styles.roleCard,
              {
                flexBasis: isDesktop ? '31%' : undefined,
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
            <Text style={styles.roleDescription}>{actor.description}</Text>
            <Text style={[styles.roleRequirements, { color: actor.accent }]}>
              Requis · {ROLE_REQUIREMENTS[role]}
            </Text>
            {selected ? (
              <View style={[styles.checkmark, { backgroundColor: actor.accent }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Step 2 — Identity ─────────────────────────────────────────────────────

function Step2Identity({
  form,
  update,
  strength,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  strength: { score: number; label: string; color: string };
}) {
  return (
    <View style={{ gap: spacing.lg }}>
      <TextField
        label="Nom complet"
        placeholder="Mohamed Ben Ali"
        value={form.fullName}
        onChangeText={(v) => update('fullName', v)}
      />
      <TextField
        autoCapitalize="none"
        keyboardType="email-address"
        label="Adresse email"
        placeholder="vous@exemple.tn"
        value={form.email}
        onChangeText={(v) => update('email', v)}
      />
      <TextField
        keyboardType="phone-pad"
        label="Mobile ( +216 )"
        placeholder="+216 2X XXX XXX"
        value={form.phone}
        onChangeText={(v) => update('phone', v)}
      />
      <TextField
        label="Mot de passe"
        placeholder="Minimum 6 caractères"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => update('password', v)}
      />
      <View style={styles.strengthWrap}>
        <View style={styles.strengthTrack}>
          <View
            style={[
              styles.strengthFill,
              { width: `${strength.score * 25}%`, backgroundColor: strength.color },
            ]}
          />
        </View>
        <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
      </View>
      <TextField
        label="Confirmation"
        placeholder="Retapez le mot de passe"
        secureTextEntry
        value={form.passwordConfirm}
        onChangeText={(v) => update('passwordConfirm', v)}
      />
      <GovernoratePicker
        value={form.governorate}
        onChange={(v) => update('governorate', v)}
      />
    </View>
  );
}

// ── Step 3 — Role-specific ────────────────────────────────────────────────

function Step3RoleSpecific({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const role = form.role;
  if (!role) return null;
  const accent = ACTORS[role].accent;

  return (
    <View style={{ gap: spacing.lg }}>
      <Card variant="tinted" tone="info">
        <Text style={styles.contextHelp}>
          <Text style={{ color: accent, fontWeight: '700' }}>Pourquoi ces informations ? </Text>
          Nous vérifions chaque inscription auprès des autorités compétentes
          pour garantir la chaîne de confiance SAFAR.
        </Text>
      </Card>

      {role === 'PHARMACY' ? (
        <>
          <TextField
            label="Nom de la pharmacie"
            placeholder="Pharmacie El Manar"
            value={form.orgName}
            onChangeText={(v) => update('orgName', v)}
          />
          <TextField
            label="Numéro de licence"
            placeholder="PH-XXXXX"
            value={form.licenseNumber}
            onChangeText={(v) => update('licenseNumber', v)}
          />
          <TextField
            label="Adresse complète"
            placeholder="Avenue Habib Bourguiba, Tunis"
            value={form.address}
            onChangeText={(v) => update('address', v)}
          />
        </>
      ) : null}

      {role === 'VET' ? (
        <>
          <TextField
            label="Numéro OVT"
            placeholder="TN-VET-XXXX"
            hint="Ordre des Vétérinaires de Tunisie"
            value={form.ovtId}
            onChangeText={(v) => update('ovtId', v)}
          />
          <TextField
            label="Spécialisation"
            placeholder="Grands animaux / Mixte / Petits animaux"
            value={form.specialization}
            onChangeText={(v) => update('specialization', v)}
          />
          <TextField
            label="Nom de la clinique"
            placeholder="Clinique vétérinaire El Amen"
            value={form.orgName}
            onChangeText={(v) => update('orgName', v)}
          />
        </>
      ) : null}

      {role === 'FARMER' ? (
        <>
          <TextField
            label="CIN"
            placeholder="8 chiffres"
            keyboardType="number-pad"
            value={form.cin}
            onChangeText={(v) => update('cin', v)}
          />
          <TextField
            label="Nom de la ferme"
            placeholder="Élevage El Amri"
            value={form.orgName}
            onChangeText={(v) => update('orgName', v)}
          />
          <TextField
            label="Type d'élevage"
            placeholder="Bovin / Ovin / Volaille / Mixte"
            value={form.farmType}
            onChangeText={(v) => update('farmType', v)}
          />
          <TextField
            label="Nombre de têtes estimé"
            placeholder="150"
            keyboardType="number-pad"
            value={form.livestockCount}
            onChangeText={(v) => update('livestockCount', v)}
          />
        </>
      ) : null}

      {role === 'SLAUGHTERHOUSE' ? (
        <>
          <TextField
            label="Nom de l'établissement"
            placeholder="Abattoir Medjez El Bab"
            value={form.orgName}
            onChangeText={(v) => update('orgName', v)}
          />
          <TextField
            label="Numéro d'enregistrement"
            placeholder="ONAGRI-XXXXX"
            value={form.licenseNumber}
            onChangeText={(v) => update('licenseNumber', v)}
          />
          <TextField
            label="Capacité (têtes / jour)"
            placeholder="100"
            keyboardType="number-pad"
            value={form.capacity}
            onChangeText={(v) => update('capacity', v)}
          />
          <TextField
            label="Adresse complète"
            placeholder="Zone industrielle, Béja"
            value={form.address}
            onChangeText={(v) => update('address', v)}
          />
        </>
      ) : null}

      {role === 'CONSUMER' ? (
        <>
          <TextField
            label="Adresse de livraison"
            placeholder="Rue, ville, gouvernorat"
            value={form.deliveryAddress}
            onChangeText={(v) => update('deliveryAddress', v)}
          />
          <TextField
            label="Préférences alimentaires (optionnel)"
            placeholder="Halal vérifié, bio préféré…"
            value={form.dietaryPref}
            onChangeText={(v) => update('dietaryPref', v)}
          />
        </>
      ) : null}

      {role !== 'CONSUMER' ? (
        <Card variant="tinted" tone="warning">
          <Text style={styles.uploadTitle}>Document justificatif</Text>
          <Text style={styles.uploadSub}>
            Téléversez votre{' '}
            {role === 'PHARMACY'
              ? 'licence pharmacie'
              : role === 'VET'
                ? 'carte OVT'
                : role === 'FARMER'
                  ? 'CIN'
                  : 'enregistrement ONAGRI'}{' '}
            (PDF ou photo).
          </Text>
          <Pressable style={styles.uploadZone}>
            <Text style={styles.uploadIcon}>⬆</Text>
            <Text style={styles.uploadCopy}>Glisser-déposer ou appuyer pour choisir</Text>
          </Pressable>
          <Text style={styles.uploadHint}>Vérification manuelle sous 24h.</Text>
        </Card>
      ) : null}
    </View>
  );
}

// ── Step 4 — Review ───────────────────────────────────────────────────────

function Step4Review({
  form,
  update,
  onEdit,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onEdit: (step: number) => void;
}) {
  const actor = form.role ? ACTORS[form.role] : null;
  return (
    <View style={{ gap: spacing.lg }}>
      <ReviewBlock
        title="Rôle"
        onEdit={() => onEdit(1)}
        rows={[{ label: 'Rôle', value: actor?.label ?? '—' }]}
      />
      <ReviewBlock
        title="Identité"
        onEdit={() => onEdit(2)}
        rows={[
          { label: 'Nom', value: form.fullName || '—' },
          { label: 'Email', value: form.email || '—' },
          { label: 'Mobile', value: form.phone || '—' },
          { label: 'Gouvernorat', value: form.governorate },
        ]}
      />
      <ReviewBlock
        title="Informations professionnelles"
        onEdit={() => onEdit(3)}
        rows={[
          form.orgName ? { label: 'Organisation', value: form.orgName } : null,
          form.licenseNumber ? { label: 'Licence', value: form.licenseNumber } : null,
          form.ovtId ? { label: 'OVT', value: form.ovtId } : null,
          form.cin ? { label: 'CIN', value: form.cin } : null,
          form.farmType ? { label: 'Type', value: form.farmType } : null,
          form.livestockCount ? { label: 'Têtes', value: form.livestockCount } : null,
          form.address ? { label: 'Adresse', value: form.address } : null,
          form.deliveryAddress ? { label: 'Livraison', value: form.deliveryAddress } : null,
        ].filter((r): r is { label: string; value: string } => !!r)}
      />

      <Pressable
        onPress={() => update('terms', !form.terms)}
        style={styles.checkRow}>
        <View style={[styles.checkbox, form.terms && styles.checkboxChecked]}>
          {form.terms ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </View>
        <Text style={styles.checkCopy}>
          J&apos;accepte les{' '}
          <Text style={styles.linkText}>conditions d&apos;utilisation</Text> et la{' '}
          <Text style={styles.linkText}>politique de confidentialité</Text>.
        </Text>
      </Pressable>

      <Pressable
        onPress={() => update('newsletter', !form.newsletter)}
        style={styles.checkRow}>
        <View style={[styles.checkbox, form.newsletter && styles.checkboxChecked]}>
          {form.newsletter ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </View>
        <Text style={styles.checkCopy}>
          Recevoir des nouvelles occasionnelles de SAFAR Chain.
        </Text>
      </Pressable>
    </View>
  );
}

function ReviewBlock({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: { label: string; value: string }[];
  onEdit: () => void;
}) {
  return (
    <Card>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Pressable onPress={onEdit} hitSlop={6}>
          <Text style={styles.reviewEdit}>Modifier</Text>
        </Pressable>
      </View>
      {rows.length === 0 ? (
        <Text style={styles.reviewEmpty}>Rien à afficher.</Text>
      ) : (
        rows.map((r) => (
          <View key={r.label} style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{r.label}</Text>
            <Text style={styles.reviewValue}>{r.value}</Text>
          </View>
        ))
      )}
    </Card>
  );
}

// ── Confirmation screen ───────────────────────────────────────────────────

function ConfirmationCard({
  role,
  email,
  onLogin,
}: {
  role: Role | null;
  email: string;
  onLogin: () => void;
}) {
  const isConsumer = role === 'CONSUMER';
  return (
    <View style={{ gap: spacing.xl, alignItems: 'center', paddingVertical: spacing['4xl'] }}>
      <View style={styles.successBubble}>
        <Text style={styles.successCheck}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Compte créé !</Text>
      <Text style={styles.successSub}>
        {isConsumer
          ? `Vérifiez votre boîte mail (${email}) pour activer votre compte.`
          : `Vérification manuelle en cours. Vous recevrez un email à ${email} sous 24h.`}
      </Text>
      <Button variant="cta-large" onPress={onLogin}>
        Accéder à la plateforme
      </Button>
      <Pressable onPress={() => router.push('/landing')} hitSlop={6}>
        <Text style={styles.linkText}>Retour à l&apos;accueil</Text>
      </Pressable>
    </View>
  );
}

// ── Supporting components ─────────────────────────────────────────────────

function GovernoratePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Text style={styles.fieldLabel}>Gouvernorat</Text>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={styles.dropdownHeader}>
        <Text style={styles.dropdownValue}>{value}</Text>
        <Text style={styles.dropdownChevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled>
            {TUNISIAN_GOVERNORATES.map((g) => (
              <Pressable
                key={g}
                onPress={() => {
                  onChange(g);
                  setOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  g === value && { backgroundColor: colors.accent.primaryMuted },
                ]}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    g === value && { color: colors.accent.primary, fontWeight: '700' },
                  ]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function stepTitle(step: number) {
  switch (step) {
    case 1:
      return 'Choisissez votre rôle';
    case 2:
      return 'Créez vos identifiants';
    case 3:
      return 'Informations professionnelles';
    case 4:
      return 'Vérifiez et confirmez';
    default:
      return '';
  }
}

function stepSubtitle(step: number, role: Role | null) {
  switch (step) {
    case 1:
      return 'Chaque rôle a un parcours d’inscription différent.';
    case 2:
      return 'Nous utilisons ces informations pour sécuriser votre compte.';
    case 3:
      return role
        ? `Spécifique à ${ACTORS[role].label.toLowerCase()}s. Vérification sous 24h.`
        : '';
    case 4:
      return 'Un dernier coup d’œil avant de créer votre compte.';
    default:
      return '';
  }
}

function passwordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (password.length === 0) return { score: 0, label: 'Tapez un mot de passe', color: colors.text.tertiary };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ['Très faible', 'Faible', 'Correct', 'Solide', 'Excellent'];
  const paletteColors = [
    colors.status.danger,
    colors.status.danger,
    colors.status.warning,
    colors.status.success,
    colors.status.success,
  ];
  return { score, label: labels[score], color: paletteColors[score] };
}

// ── Styles ────────────────────────────────────────────────────────────────

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
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.strong,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  checkboxTick: {
    color: '#0A0E12',
    fontSize: 13,
    fontWeight: '800',
  },
  checkCopy: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    fontSize: 14,
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
  checkRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contextHelp: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dropdownChevron: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  dropdownHeader: {
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  dropdownItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dropdownItemText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  dropdownList: {
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownValue: {
    color: colors.text.primary,
    fontSize: 15,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.overline,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  footerLink: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
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
  linkText: {
    color: colors.accent.primary,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressFill: {
    borderRadius: radii.full,
    height: '100%',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: -spacing.sm,
  },
  progressTrack: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.full,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  reviewEdit: {
    color: colors.accent.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewEmpty: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    flex: 1,
  },
  reviewRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  reviewTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  reviewValue: {
    color: colors.text.primary,
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
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
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roleLabel: {
    ...typography.section,
    color: colors.text.primary,
    fontSize: 15,
  },
  roleRequirements: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  strengthFill: {
    borderRadius: radii.full,
    height: '100%',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  strengthTrack: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.full,
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
  strengthWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: -spacing.md,
  },
  successBubble: {
    alignItems: 'center',
    backgroundColor: withAlpha(tokens.success, 0.14),
    borderColor: withAlpha(tokens.success, 0.4),
    borderRadius: radii.full,
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    width: 96,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: `0 0 32px ${withAlpha(tokens.success, 0.4)}` } as object)
      : null),
  },
  successCheck: {
    color: colors.status.success,
    fontSize: 48,
    fontWeight: '800',
  },
  successSub: {
    ...typography.body,
    color: colors.text.secondary,
    maxWidth: 420,
    textAlign: 'center',
  },
  successTitle: {
    ...typography.display,
    fontSize: 32,
    textAlign: 'center',
  },
  uploadCopy: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  uploadHint: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 10,
  },
  uploadIcon: {
    color: colors.accent.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  uploadSub: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  uploadTitle: {
    ...typography.section,
    fontSize: 14,
  },
  uploadZone: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
  },
});
