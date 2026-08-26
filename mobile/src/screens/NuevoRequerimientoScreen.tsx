/**
 * NuevoRequerimientoScreen — Screen 10: Formulario de Nuevo Requerimiento
 * (MOD-18 / RF-173..176 / RN-029..034). Acceso: user sanidad.
 *
 * Campos: Fecha (default hoy), Fundo, Lote (por fundo), Especie, Etapa
 * fenológica, Cantidad (millares), Stock (solo lectura, se actualiza por
 * especie vía `obtenerStockEspecie`), Plaga objetivo, Observaciones y Fotos.
 *
 * Reglas de stock (RN-031/032): la cantidad no puede superar el stock
 * disponible; si el stock es 0 se bloquea "Stock agotado". Al enviar (si los
 * obligatorios están completos) crea el requerimiento, sube fotos al servidor
 * y vuelve a Screen 9.
 */

import React, {useCallback, useState} from 'react';
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import DateTimePickerField from '../components/DateTimePickerField';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SelectField from '../components/SelectField';
import {usePhotoCapture} from '../hooks/usePhotoCapture';
import {useRequerimientosCatalogos} from '../hooks/useRequerimientosCatalogos';
import type {RootStackParamList} from '../navigation/types';
import {
  crearRequerimiento,
  extractErrorMessage,
  obtenerStockEspecie,
  subirFotoRequerimiento,
} from '../services/ApiClient';
import {theme} from '../theme';
import {
  camposObligatoriosFaltantes,
  cantidadDesdeTexto,
  hoyISO,
  validarCantidadVsStock,
  type FormularioRequerimientoBasico,
} from '../utils/requerimientos';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const MAX_PHOTOS = 2;

export default function NuevoRequerimientoScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  const catalogo = useRequerimientosCatalogos();
  const {
    fotos,
    fotoError,
    tomarFoto,
    seleccionarFoto,
    quitarFoto,
  } = usePhotoCapture(MAX_PHOTOS);

  const [fechaInput, setFechaInput] = useState(hoyISO());
  const [fundoId, setFundoId] = useState<number | null>(null);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [cantidadTexto, setCantidadTexto] = useState('');
  const [plagaId, setPlagaId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');

  const [stock, setStock] = useState<number | null>(null);
  // errorCatalogo (del hook) → ErrorState a pantalla completa; errorEnvio
  // (fallo al crear) → alert inline sin ocultar los datos del formulario.
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cambiarFundo = (value: number | string) => {
    const fid = Number(value);
    setFundoId(fid);
    setLoteId(null);
    catalogo.cargarLotes(fid);
  };

  const cambiarEspecie = useCallback(
    async (value: number | string) => {
      const eid = Number(value);
      setEspecieId(eid);
      setStock(null);
      try {
        const res = await obtenerStockEspecie(eid);
        setStock(res.stock);
      } catch {
        setStock(null);
      }
    },
    [],
  );

  const cantidadNum = cantidadDesdeTexto(cantidadTexto);
  const isoFecha = fechaInput;

  const basico: FormularioRequerimientoBasico = {
    fecha: isoFecha ?? '',
    fundoId,
    loteId,
    especieId,
    etapaFenologicaId: etapaId,
    cantidad: cantidadNum,
    plagaId,
    observaciones,
  };
  const faltantes = camposObligatoriosFaltantes(basico);
  const stockError = stock != null ? validarCantidadVsStock(cantidadNum, stock) : null;
  const puedeEnviar = faltantes.length === 0 && stockError == null;

  const enviar = async () => {
    setSaving(true);
    setErrorEnvio(null);
    try {
      const nuevo = await crearRequerimiento({
        fecha: isoFecha ?? hoyISO(),
        fundoId: fundoId!,
        loteId: loteId!,
        especieId: especieId!,
        etapaFenologicaId: etapaId,
        cantidad: cantidadNum,
        plagaId,
        observaciones: observaciones.trim() || null,
      });
      // Subir fotos locales al servidor
      for (const foto of fotos) {
        await subirFotoRequerimiento(nuevo.id, {
          uri: foto.uri,
          type: foto.type,
          name: foto.fileName,
        }, JSON.stringify({tipo: 'EVIDENCIA'}));
      }
      navigation.goBack();
    } catch (e) {
      setErrorEnvio(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const opcionesFundo = catalogo.fundos.map(f => ({label: f.nombre, value: f.id}));
  const opcionesLote = catalogo.lotes.map(l => ({label: l.nombre, value: l.id}));
  const opcionesEspecie = catalogo.especies.map(e => ({label: e.nombre, value: e.id}));
  const opcionesEtapa = catalogo.etapas.map(e => ({label: e.nombre, value: e.id}));
  const opcionesPlaga = catalogo.plagas.map(p => ({label: p.nombre, value: p.id}));

  if (catalogo.errorCatalogo) {
    return (
      <ErrorBoundary
        fallbackTitle="No se pudo cargar el formulario"
        fallbackMessage="Reintente nuevamente o cierre su sesión.">
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <AppHeader title="Nuevo Requerimiento" showBack onBack={navigation.goBack} />
          <ErrorState onRetry={catalogo.reload} />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el formulario"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Nuevo Requerimiento"
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
            {catalogo.loadingCatalogo ? (
              <LoadingState message="Cargando catálogos…" />
            ) : (
              <>
                {errorEnvio ? (
                  <View accessibilityRole="alert" style={styles.notificacionError}>
                    <Text style={styles.notificacionText}>{errorEnvio}</Text>
                  </View>
                ) : null}
                <DateTimePickerField
                  label="Fecha"
                  value={fechaInput}
                  mode="date"
                  onChange={setFechaInput}
                  accessibilityLabel="Fecha"
                />
                <SelectField
                  label="Fundo"
                  optionAccessibilityPrefix="Opción Fundo"
                  value={catalogo.fundos.find(f => f.id === fundoId)?.nombre ?? ''}
                  options={opcionesFundo}
                  onSelect={cambiarFundo}
                  disabled={catalogo.fundos.length === 0}
                />
                <SelectField
                  label="Lote"
                  optionAccessibilityPrefix="Opción Lote"
                  value={catalogo.lotes.find(l => l.id === loteId)?.nombre ?? ''}
                  options={opcionesLote}
                  onSelect={v => setLoteId(Number(v))}
                  disabled={fundoId == null || catalogo.lotes.length === 0}
                />
                <SelectField
                  label="Especie"
                  optionAccessibilityPrefix="Opción Especie"
                  value={catalogo.especies.find(e => e.id === especieId)?.nombre ?? ''}
                  options={opcionesEspecie}
                  onSelect={cambiarEspecie}
                  disabled={catalogo.especies.length === 0}
                />
                <SelectField
                  label="Etapa fenológica"
                  optionAccessibilityPrefix="Opción Etapa"
                  value={catalogo.etapas.find(e => e.id === etapaId)?.nombre ?? ''}
                  options={opcionesEtapa}
                  onSelect={v => setEtapaId(Number(v))}
                  disabled={catalogo.etapas.length === 0}
                />
                <AppInput
                  label="Cantidad (millares)"
                  value={cantidadTexto}
                  onChangeText={setCantidadTexto}
                  keyboardType="number-pad"
                  maxLength={6}
                  accessibilityLabel="Cantidad"
                />
                <View style={styles.stockBlock}>
                  <Text style={styles.stockLabel}>Stock disponible</Text>
                  <Text
                    style={[
                      styles.stockValue,
                      stock != null && stock <= 0 && styles.stockAgotado,
                    ]}
                    accessibilityLabel="Stock disponible">
                    {stock != null ? `${stock} millares` : 'Cargando…'}
                  </Text>
                  {stockError ? (
                    <Text style={styles.stockError}>{stockError}</Text>
                  ) : null}
                </View>
                <SelectField
                  label="Plaga objetivo"
                  optionAccessibilityPrefix="Opción Plaga"
                  value={catalogo.plagas.find(p => p.id === plagaId)?.nombre ?? ''}
                  options={opcionesPlaga}
                  onSelect={v => setPlagaId(Number(v))}
                  disabled={catalogo.plagas.length === 0}
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

                <Text style={styles.fotoTitulo}>Fotos (evidencia)</Text>
                <View style={styles.fotoRow}>
                  <AppButton
                    label="Cámara"
                    icon="camera-outline"
                    variant="secondary"
                    disabled={fotos.length >= MAX_PHOTOS}
                    onPress={tomarFoto}
                    accessibilityLabel="Tomar foto"
                  />
                  <AppButton
                    label="Galería"
                    icon="image-outline"
                    variant="secondary"
                    disabled={fotos.length >= MAX_PHOTOS}
                    onPress={seleccionarFoto}
                    accessibilityLabel="Seleccionar foto de la galería"
                  />
                </View>
                {fotoError ? <Text accessibilityRole="alert" style={styles.fotoError}>{fotoError}</Text> : null}
                <View style={styles.fotoPreviews}>
                  {fotos.map((foto, idx) => (
                    <View key={foto.uri} style={styles.fotoPreview}>
                      <Image source={{uri: foto.uri}} style={styles.fotoImagen} />
                      <Text style={styles.fotoPreviewText}>Foto {idx + 1}</Text>
                      <AppButton label="Quitar" icon="delete-outline" variant="text" onPress={() => quitarFoto(idx)} accessibilityLabel={`Quitar foto ${idx + 1}`} />
                    </View>
                  ))}
                </View>

                {faltantes.length > 0 ? (
                  <Text style={styles.ayuda}>
                    Faltan: {faltantes.join(', ')}
                  </Text>
                ) : null}
                {stockError ? (
                  <Text style={styles.ayuda}>No se puede enviar: {stockError}</Text>
                ) : null}

                <AppButton
                  label="Enviar Solicitud"
                  icon="send-outline"
                  loading={saving}
                  disabled={!puedeEnviar}
                  onPress={enviar}
                  accessibilityLabel="Enviar Solicitud"
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
  stockAgotado: {
    color: theme.colors.status.error,
  },
  stockError: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 13,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
  },
  fotoTitulo: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  fotoRow: {
    marginBottom: theme.spacing[2],
  },
  fotoPreviews: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
    marginBottom: theme.spacing[2],
  },
  fotoError: {
    color: theme.colors.status.error,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing[2],
  },
  fotoPreview: {
    width: 112,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.neutral,
    alignItems: 'center',
    paddingTop: theme.spacing[1],
  },
  fotoImagen: {
    width: 104,
    height: 76,
    borderRadius: theme.radius.sm,
  },
  fotoPreviewText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  ayuda: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.status.warning,
    marginBottom: theme.spacing[2],
  },
  notificacionError: {
    backgroundColor: theme.colors.status.errorBackground,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  notificacionText: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.primary,
  },
});
