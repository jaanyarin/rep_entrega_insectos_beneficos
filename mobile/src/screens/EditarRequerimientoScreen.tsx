/**
 * EditarRequerimientoScreen — Screen 13: Edición de Requerimiento (user)
 * (MOD-18 / RF-182..185 / RN-035..036). Acceso: user sanidad.
 *
 * Mismos campos de Screen 10 pre-cargados (base solo lectura), más:
 *  - Fecha y Hora de liberación: se auto-completan con los metadatos del
 *    sistema al tomar la foto (RN-036).
 *  - Botón Foto (stub, hasta 2; el backend no soporta upload aún).
 *  - Alerta permanente de 30 h (RN-035): si desde que el estado pasó a
 *    RECIBIDO transcurrió >30 h sin foto de liberación.
 *  - Botón "Actualizar" → guarda y vuelve a Screen 12.
 */

import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SelectField from '../components/SelectField';
import {useRequerimientosCatalogos} from '../hooks/useRequerimientosCatalogos';
import type {RootStackParamList} from '../navigation/types';
import {
  actualizarRequerimiento,
  extractErrorMessage,
  obtenerRequerimiento,
  obtenerStockEspecie,
} from '../services/ApiClient';
import {theme} from '../theme';
import {
  cantidadDesdeTexto,
  formatoFechaInput,
  horaActual,
  hoyISO,
  isoDesdeInputFecha,
  requiereAlertaLiberacion,
  toISODate,
} from '../utils/requerimientos';
import RequerimientoStatusChip from '../components/RequerimientoStatusChip';
import {formatFecha} from '../utils/programacion';

type Route = RouteProp<RootStackParamList, 'EditarRequerimiento'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function EditarRequerimientoScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const id = route.params.id;
  const catalogo = useRequerimientosCatalogos();

  const [fechaInput, setFechaInput] = useState('');
  const [fundoId, setFundoId] = useState<number | null>(null);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [cantidadTexto, setCantidadTexto] = useState('');
  const [plagaId, setPlagaId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [fechaLiberacionInput, setFechaLiberacionInput] = useState('');
  const [horaLiberacion, setHoraLiberacion] = useState('');
  const [estado, setEstado] = useState<string>('REGISTRADO');
  const [stock, setStock] = useState<number | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [alerta30, setAlerta30] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await obtenerRequerimiento(id);
        if (!activo) {
          return;
        }
        setFechaInput(formatoFechaInput(r.fecha));
        setFundoId(r.fundoId);
        setLoteId(r.loteId);
        setEspecieId(r.especieId);
        setEtapaId(r.etapaFenologicaId);
        setCantidadTexto(String(r.cantidad));
        setPlagaId(r.plagaId);
        setObservaciones(r.observaciones ?? '');
        setFechaLiberacionInput(formatoFechaInput(r.fechaLiberacion));
        setHoraLiberacion(r.horaLiberacion ?? '');
        setEstado(r.estado);
        setAlerta30(requiereAlertaLiberacion(r));
        // Carga el stock de la especie del requerimiento (solo lectura).
        setStock(null);
        try {
          const s = await obtenerStockEspecie(r.especieId);
          if (activo) {
            setStock(s.stock);
          }
        } catch {
          if (activo) {
            setStock(null);
          }
        }
      } catch (e) {
        if (activo) {
          setError(extractErrorMessage(e));
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [id]);

  const tomarFoto = () => {
    if (fotos.length >= 2) {
      return;
    }
    setFotos(prev => [...prev, `liberacion-${prev.length + 1}-stub.jpg`]);
    setFechaLiberacionInput(formatoFechaInput(toISODate(new Date())));
    setHoraLiberacion(horaActual());
  };

  const actualizar = async () => {
    setSaving(true);
    setError(null);
    try {
      await actualizarRequerimiento(id, {
        fecha: isoDesdeInputFecha(fechaInput) ?? hoyISO(),
        fundoId: fundoId!,
        loteId: loteId!,
        especieId: especieId!,
        etapaFenologicaId: etapaId,
        cantidad: cantidadDesdeTexto(cantidadTexto),
        plagaId,
        estado: estado as never,
        fechaLiberacion: isoDesdeInputFecha(fechaLiberacionInput),
        horaLiberacion: horaLiberacion.trim() || null,
        observaciones: observaciones.trim() || null,
      });
      navigation.goBack();
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const opcionesFundo = catalogo.fundos.map(f => ({label: f.nombre, value: f.id}));
  const opcionesLote = catalogo.lotes.map(l => ({label: l.nombre, value: l.id}));
  const opcionesEspecie = catalogo.especies.map(e => ({label: e.nombre, value: e.id}));
  const opcionesEtapa = catalogo.etapas.map(e => ({label: e.nombre, value: e.id}));
  const opcionesPlaga = catalogo.plagas.map(p => ({label: p.nombre, value: p.id}));

  if (error) {
    return (
      <ErrorBoundary
        fallbackTitle="No se pudo cargar el requerimiento"
        fallbackMessage="Reintente nuevamente o cierre su sesión.">
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <AppHeader title="Editar Requerimiento" showBack onBack={navigation.goBack} />
          <ErrorState onRetry={undefined} />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el requerimiento"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Editar Requerimiento"
          showBack
          onBack={navigation.goBack}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {paddingBottom: 32 + insets.bottom},
            ]}
            keyboardShouldPersistTaps="handled">
            {loading ? (
              <LoadingState message="Cargando requerimiento…" />
            ) : (
              <>
                <View style={styles.estadoChip}>
                  <RequerimientoStatusChip estado={estado as never} />
                </View>

                {alerta30 ? (
                  <View
                    accessibilityRole="alert"
                    style={styles.alerta30}>
                    <Text style={styles.alerta30Text}>
                      {`Alerta: No se ingresó la información de la liberación, fecha de solicitud: ${formatFecha(fechaInput)}`}
                    </Text>
                  </View>
                ) : null}

                <AppInput
                  label="Fecha"
                  value={fechaInput}
                  editable={false}
                  accessibilityLabel="Fecha"
                />
                <SelectField
                  label="Fundo"
                  accessibilityLabel="Fundo"
                  optionAccessibilityPrefix="Opción Fundo"
                  value={catalogo.fundos.find(f => f.id === fundoId)?.nombre ?? ''}
                  options={opcionesFundo}
                  onSelect={v => setFundoId(Number(v))}
                  disabled
                />
                <SelectField
                  label="Lote"
                  accessibilityLabel="Lote"
                  optionAccessibilityPrefix="Opción Lote"
                  value={catalogo.lotes.find(l => l.id === loteId)?.nombre ?? ''}
                  options={opcionesLote}
                  onSelect={v => setLoteId(Number(v))}
                  disabled
                />
                <SelectField
                  label="Especie"
                  accessibilityLabel="Especie"
                  optionAccessibilityPrefix="Opción Especie"
                  value={catalogo.especies.find(e => e.id === especieId)?.nombre ?? ''}
                  options={opcionesEspecie}
                  onSelect={v => setEspecieId(Number(v))}
                  disabled
                />
                <SelectField
                  label="Etapa fenológica"
                  accessibilityLabel="Etapa fenológica"
                  optionAccessibilityPrefix="Opción Etapa"
                  value={catalogo.etapas.find(e => e.id === etapaId)?.nombre ?? ''}
                  options={opcionesEtapa}
                  onSelect={v => setEtapaId(Number(v))}
                  disabled
                />
                <AppInput
                  label="Cantidad (millares)"
                  value={cantidadTexto}
                  editable={false}
                  accessibilityLabel="Cantidad"
                />
                <View style={styles.stockBlock}>
                  <Text style={styles.stockLabel}>Stock disponible</Text>
                  <Text style={styles.stockValue} accessibilityLabel="Stock disponible">
                    {stock != null ? `${stock} millares` : 'Cargando…'}
                  </Text>
                </View>
                <SelectField
                  label="Plaga objetivo"
                  accessibilityLabel="Plaga objetivo"
                  optionAccessibilityPrefix="Opción Plaga"
                  value={catalogo.plagas.find(p => p.id === plagaId)?.nombre ?? ''}
                  options={opcionesPlaga}
                  onSelect={v => setPlagaId(Number(v))}
                  disabled
                />
                <AppInput
                  label="Observaciones"
                  value={observaciones}
                  onChangeText={setObservaciones}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  accessibilityLabel="Observaciones"
                />
                <AppInput
                  label="Fecha de liberación"
                  placeholder="dd/mm/aaaa"
                  value={fechaLiberacionInput}
                  onChangeText={setFechaLiberacionInput}
                  maxLength={10}
                  accessibilityLabel="Fecha de liberación"
                />
                <AppInput
                  label="Hora de liberación"
                  placeholder="HH:mm"
                  value={horaLiberacion}
                  onChangeText={setHoraLiberacion}
                  maxLength={5}
                  accessibilityLabel="Hora de liberación"
                />

                <Text style={styles.fotoTitulo}>Foto de liberación</Text>
                <AppButton
                  label="Foto"
                  icon="camera-outline"
                  variant="secondary"
                  disabled={fotos.length >= 2}
                  onPress={tomarFoto}
                  accessibilityLabel="Tomar foto de liberación"
                />
                <View style={styles.fotoPreviews}>
                  {fotos.map((uri, idx) => (
                    <View key={uri} style={styles.fotoPreview}>
                      <Text style={styles.fotoPreviewText}>Liberación {idx + 1}</Text>
                      <Text style={styles.fotoPreviewStub}>stub</Text>
                    </View>
                  ))}
                </View>

                <AppButton
                  label="Actualizar"
                  icon="content-save-outline"
                  loading={saving}
                  onPress={actualizar}
                  accessibilityLabel="Actualizar requerimiento"
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
  },
  estadoChip: {
    marginBottom: theme.spacing[3],
  },
  alerta30: {
    backgroundColor: theme.colors.status.errorBackground,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.status.error,
  },
  alerta30Text: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.status.error,
  },
  stockBlock: {
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
  },
  stockLabel: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  stockValue: {
    fontFamily: theme.typography.subtitle1.fontFamily,
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.colors.text.primary,
  },
  fotoTitulo: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  fotoPreviews: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  fotoPreview: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.neutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoPreviewText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  fotoPreviewStub: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 10,
    color: theme.colors.text.tertiary,
  },
});
