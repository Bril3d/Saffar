/**
 * Consumer — Product Detail Screen
 * Full product info with trust score, AWaRe badge, traceability CTA.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getProduct, getTraceability } from '@/services/api';
import { addToCart } from '@/app/(consumer)/cart';
import type { ProductResponse, TraceResponse } from '@/services/types';
import { FileText, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react-native';

const productImages = {
  eggs: require('@/assets/images/eggs.png'),
  honey: require('@/assets/images/honey.png'),
  beef: require('@/assets/images/beef.png'),
  sheep: require('@/assets/images/sheep.png'),
  cattle: require('@/assets/images/cattle.png'),
};

function getImageForProduct(title: string) {
  const t = title.toLowerCase();
  if (t.includes('oeuf') || t.includes('poulet') || t.includes('chicken') || t.includes('egg')) return productImages.eggs;
  if (t.includes('miel') || t.includes('honey')) return productImages.honey;
  if (t.includes('mouton') || t.includes('ovin') || t.includes('sheep') || t.includes('agneau')) return productImages.sheep;
  if (t.includes('bovin') || t.includes('boeuf') || t.includes('beef') || t.includes('viande')) return productImages.beef;
  return productImages.cattle;
}

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = React.useState<ProductResponse | null>(null);
  const [trace, setTrace] = React.useState<TraceResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    getProduct(params.id)
      .then(async (res) => {
        setProduct(res.product);
        if (res.product?.lot_id) {
          try {
            const traceData = await getTraceability(res.product.lot_id);
            setTrace(traceData);
          } catch {
            setTrace(null);
          }
        }
      })
      .catch(() => {
        setProduct(null);
        setTrace(null);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const trustScore = trace?.trustScore ?? (Math.round((product?.avg_rating || 0) * 20) || 0);
  const lastControl = trace?.prescriptions?.[trace.prescriptions.length - 1];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
        ) : !product ? (
          <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 80 }}>Produit introuvable</Text>
        ) : (
          <>
            {/* Image Box */}
            <View style={s.imageBox}>
              <Image source={getImageForProduct(product.title)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <TouchableOpacity onPress={() => router.back()} style={s.floatBack} activeOpacity={0.7}>
                <ArrowLeft size={24} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={s.content}>
              {/* Title & price */}
              <View style={s.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{product.title}</Text>
                  <Text style={s.farm}>{product.farmer_name}</Text>
                </View>
                <Text style={s.price}>{product.price_per_unit.toFixed(3)} TND</Text>
              </View>

              {/* Trust Score */}
              <View style={s.trustCard}>
                <View style={s.trustLeft}>
                  <View style={s.trustCircle}>
                    <Text style={s.trustValue}>{trustScore}</Text>
                  </View>
                  <View>
                    <Text style={s.trustLabel}>Score de Confiance</Text>
                    <Text style={s.trustSub}>Basé sur la traçabilité blockchain</Text>
                  </View>
                </View>
                <ShieldCheck size={32} color={Colors.primary} style={{ opacity: 0.2 }} />
              </View>

              {/* AWaRe Badge */}
              {lastControl && (
                <View style={s.awareBadge}>
                  <View style={[s.awareDot, { backgroundColor: Colors.aware.access }]} />
                  <Text style={[s.awareText, { color: Colors.aware.access }]}>WHO AWaRe: {lastControl.awareClass}</Text>
                  <Text style={s.awareDetail}>{lastControl.antibiotic}</Text>
                </View>
              )}

              {/* Details */}
              <View style={s.detailCard}>
                <Text style={s.sectionTitle}>Informations</Text>
                <View style={s.row}><Text style={s.lbl}>Lot</Text><Text style={s.val}>#{product.lot_id}</Text></View>
                <View style={s.row}><Text style={s.lbl}>Lieu</Text><Text style={s.val}>{product.farmer_governorate || '-'}</Text></View>
                <View style={s.row}><Text style={s.lbl}>Certifié le</Text><Text style={s.val}>{product.lot_certified_at ? new Date(product.lot_certified_at).toLocaleDateString('fr-FR') : 'Trace vet-farmer'}</Text></View>
                <View style={s.row}>
                  <Text style={s.lbl}>Retrait respecté</Text>
                  <Text style={[s.val, { color: trace?.lotDetails?.inWithdrawal ? Colors.warning : Colors.success }]}>
                    {trace?.lotDetails?.inWithdrawal ? '⏳ En retrait' : ' Oui'}
                  </Text>
                </View>
                <View style={s.row}><Text style={s.lbl}>Dernier contrôle</Text><Text style={s.val}>{lastControl ? `${lastControl.antibiotic}` : '-'}</Text></View>
                {product.certificate_hash && (
                  <View style={s.row}>
                    <Text style={s.lbl}>Certificat</Text>
                    <Text style={s.hashVal} numberOfLines={1} ellipsizeMode="middle">{product.certificate_hash}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <TouchableOpacity style={s.traceBtn} onPress={() => router.push({ pathname: '/(consumer)/traceability', params: { lotId: product.lot_id } } as any)} activeOpacity={0.7}>
                <FileText size={20} color={Colors.primary} />
                <Text style={s.traceBtnText}>Voir la traçabilité complète</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.orderBtn}
                activeOpacity={0.85}
                onPress={() => {
                  if (!product) return;
                  addToCart({
                    productId: product.id,
                    name: product.title,
                    farm: product.farmer_name,
                    price: product.price_per_unit,
                    qty: 1,
                  });
                  Alert.alert('Panier', `${product.title} ajouté au panier`, [
                    { text: 'Continuer', style: 'cancel' },
                    { text: 'Voir le panier', onPress: () => router.push('/(consumer)/cart') },
                  ]);
                }}
              >
                <ShoppingCart size={20} color={Colors.onPrimary} />
                <Text style={s.orderBtnText}>Ajouter au panier</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  
  imageBox: { height: 260, backgroundColor: Colors.surfaceContainerLow, position: 'relative' },
  floatBack: { 
    position: 'absolute', top: 16, left: 16, 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm 
  },
  
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  title: { fontSize: 26, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.5 },
  farm: { fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 4 },
  price: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  
  trustCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primary + '1A', 
    borderRadius: Radii.xl, 
    padding: Spacing.lg, 
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  trustLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trustCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  trustValue: { fontSize: 22, fontWeight: '900', color: Colors.onPrimary },
  trustLabel: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  trustSub: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  
  awareBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, 
    backgroundColor: Colors.aware.access + '1A', 
    borderRadius: Radii.lg, padding: Spacing.md, 
    marginBottom: Spacing.md, flexWrap: 'wrap' 
  },
  awareDot: { width: 8, height: 8, borderRadius: 4 },
  awareText: { fontSize: 14, fontWeight: '700' },
  awareDetail: { fontSize: 13, color: Colors.onSurfaceVariant, width: '100%', marginTop: 4 },
  
  detailCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  lbl: { fontSize: 14, color: Colors.onSurfaceVariant },
  val: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  hashVal: { fontSize: 13, fontFamily: Fonts?.mono, color: Colors.primary, maxWidth: '60%' },
  
  traceBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.full, paddingVertical: 16, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary,
  },
  traceBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  
  orderBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, 
    borderRadius: Radii.full, paddingVertical: 18, 
    ...Shadows.md 
  },
  orderBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
