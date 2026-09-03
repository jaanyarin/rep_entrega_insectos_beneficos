/**
 * RequerimientoFormScreen — Screen 8: Formulario de Solicitud de Requerimiento
 * (MOD-18 / RF-158..167). Acceso: admin i+d.
 *
 * Comportamiento por modo:
 *  - Creación (sin `id`): campos base habilitados; Papel/Sobre deshabilitados
 *    (RF-162).
 *  - Edición (con `id`): solo Estado habilitado; Papel/Sobre se habilitan
 *    únicamente si Estado = Entregado (RF-163/164).
 *
 * Validación (RF-165): si Estado = Entregado → Papel + Sobre obligatorios y su
 * suma == cantidad plaga para habilitar Guardar. Al guardar → vuelve a Screen 7.
 *
 * Pendientes (deuda, backend aún no existe):
 *  - POST /requerimientos (crear) no acepta estado/presentaciones en el
 *    contrato actual; se persisten solo al editar (PUT).
 *  - El botón "Acta PDF" de captura de acta (RF-160/161) queda pendiente:
 *    el backend no soporta aún subir la evidencia.
 */

import React, {useCallback, useEffect, useState} from 'react';
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
import DateTimePickerField from '../components/DateTimePickerField';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SelectField from '../components/SelectField';
import {useRequerimientosCatalogos} from '../hooks/useRequerimientosCatalogos';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/types';
import {
  extractErrorMessage,
  type EstadoRequerimiento,
  type PlagaDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {
  cantidadDesdeTexto,
  estadoInfo,
  ESTADOS_ADMIN,
  esEstadoEntregado,
  hoyISO,
} from '../utils/requerimientos';
import {requerimientosRepo} from '../db/repositories';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';

type Route = RouteProp<RootStackParamList, 'RequerimientoForm'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function RequerimientoFormScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const id = route.params?.id;
  const modo: 'crear' | 'editar' = id != null ? 'editar' : 'crear';

  const catalogo = useRequerimientosCatalogos();

  const [fechaInput, setFechaInput] = useState('');
  const [fundoId, setFundoId] = useState<number | null>(null);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [cantidadTexto, setCantidadTexto] = useState('');
  const [plagaId, setPlagaId] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoRequerimiento>('PENDIENTE');
  const [fechaLiberacionInput, setFechaLiberacionInput] = useState('');
  const [horaLiberacion, setHoraLiberacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [papelTexto, setPapelTexto] = useState('');
  const [sobreTexto, setSobreTexto] = useState('');

  const [loading, setLoading] = useState(modo === 'editar');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avisoActa, setAvisoActa] = useState<string | null>(null);

  // Fecha por defecto (creación): hoy.
  useEffect(() => {
    if (modo === 'crear') {
      setFechaInput(hoyISO());
    }
  }, [modo]);

  const cargarRequerimiento = useCallback(async (targetId: number) => {
    setLoading(true);
    setError(null);

    // Helper: llenar state desde un DTO del API
    const fillFromDto = (r: {fecha: string; fundoId: number; loteId: number; especieId: number; cantidad: number; plagaId: number | null; estado: EstadoRequerimiento; fechaLiberacion?: string | null; horaLiberacion?: string | null; observaciones?: string | null; papelConPostura?: number | null; sobreConCascarilla?: number | null}) => {
      setFechaInput(r.fecha);
      setFundoId(r.fundoId);
      setLoteId(r.loteId);
      setEspecieId(r.especieId);
      setCantidadTexto(String(r.cantidad));
      setPlagaId(r.plagaId);
      setEstado(r.estado);
      setFechaLiberacionInput(r.fechaLiberacion ?? '');
      setHoraLiberacion(r.horaLiberacion ?? '');
      setObservaciones(r.observaciones ?? '');
      setPapelTexto(r.papelConPostura != null ? String(r.papelConPostura) : '');
      setSobreTexto(r.sobreConCascarilla != null ? String(r.sobreConCascarilla) : '');
    };

    // Paso 1: intentar SQLite (puede fallar en release APK)
    let foundLocal = false;
    try {
      let local = await requerimientosRepo.getByServerId(targetId);
      if (!local && targetId < 0) {
        local = await requerimientosRepo.getByIdLocal(targetId);
      }
      if (local) {
        fillFromDto({
          fecha: local.fecha,
          fundoId: local.fundoId,
          loteId: local.loteId,
          especieId: local.especieId,
          cantidad: local.cantidad,
          plagaId: local.plagaId,
          estado: local.estado as EstadoRequerimiento,
          fechaLiberacion: local.fechaLiberacion,
          horaLiberacion: local.horaLiberacion,
          observaciones: local.observaciones,
          papelConPostura: local.papelConPostura,
          sobreConCascarilla: local.sobreConCascarilla,
        });
        foundLocal = true;
      }
    } catch {
      // SQLite falló (release APK) — continuar con fallback API
    }

    // Paso 2: si no se encontró localmente, intentar API
    if (!foundLocal) {
      try {
        const {obtenerRequerimiento} = await import('../services/ApiClient');
        const r = await obtenerRequerimiento(targetId);
        fillFromDto(r);
      } catch (e) {
        setError(extractErrorMessage(e));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (modo === 'editar' && id != null) {
      cargarRequerimiento(id);
    }
  }, [id, modo, cargarRequerimiento]);

  const cambiarFundo = (value: number | string) => {
    const fid = Number(value);
    setFundoId(fid);
    setLoteId(null);
    catalogo.cargarLotes(fid);
  };

  // RF-162: en creación Papel/Sobre están deshabilitados; en edición se
  // habilitan únicamente si el estado es Entregado (RF-163/164).
  const papelSobreHabilitados =
    modo === 'editar' && esEstadoEntregado(estado);
  // Otros campos (fecha/fundo/lote/especie/cantidad/objetivo) solo editables en creación.
  const camposBaseHabilitados = modo === 'crear';
  // El campo Estado es siempre editable (creación y edición, RF-163).
  const estadoEditable = true;

  const isoFecha = fechaInput;
  const isoFechaLiberacion = fechaLiberacionInput || null;
  const cantidadNum = cantidadDesdeTexto(cantidadTexto);
  const papelNum = cantidadDesdeTexto(papelTexto);
  const sobreNum = cantidadDesdeTexto(sobreTexto);
  const baseOk =
    !!isoFecha &&
    fundoId != null &&
    loteId != null &&
    especieId != null &&
    cantidadNum > 0 &&
    plagaId != null;
  const presentacionesOk =
    papelNum > 0 && sobreNum > 0 && papelNum + sobreNum === cantidadNum;
  const puedeGuardar =
    baseOk && (estado !== 'ENTREGADO' || presentacionesOk);

  const guardar = async () => {
    setSaving(true);
    setAvisoActa(null);
    try {
      if (modo === 'crear') {
        // Offline-first: guardar en SQLite + outbox
        await requerimientosRepo.createLocal(
          {
            fecha: isoFecha ?? hoyISO(),
            fundoId: fundoId!,
            loteId: loteId!,
            especieId: especieId!,
            etapaFenologicaId: null,
            cantidad: cantidadNum,
            plagaId,
            observaciones: observaciones.trim() || null,
          },
          Number(user?.sub) || 0,
        );
      } else {
        // Editar: encontrar el localId real
        let localId = id!;
        const local = await requerimientosRepo.getByServerId(id!);
        if (local) {
          localId = local.id;
        }
        await requerimientosRepo.updateLocal(localId, {
          fecha: isoFecha ?? hoyISO(),
          fundoId: fundoId!,
          loteId: loteId!,
          especieId: especieId!,
          etapaFenologicaId: null,
          cantidad: cantidadNum,
          plagaId,
          estado,
          papelConPostura: papelNum > 0 ? papelNum : null,
          sobreConCascarilla: sobreNum > 0 ? sobreNum : null,
          fechaLiberacion: isoFechaLiberacion,
          horaLiberacion: horaLiberacion.trim() || null,
          observaciones: observaciones.trim() || null,
        });
      }
      navigation.goBack();
    } catch (e) {
      setAvisoActa(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  // Opciones del selector de Estado (incluye el estado actual si no está en la lista admin).
  const opcionesEstado = (() => {
    const lista = ESTADOS_ADMIN.includes(estado) ? ESTADOS_ADMIN : [estado, ...ESTADOS_ADMIN];
    return lista.map(est => ({label: estadoInfo(est).label, value: est}));
  })();

  const opcionesFundo = catalogo.fundos.map(f => ({label: f.nombre, value: f.id}));
  const opcionesLote = catalogo.lotes.map(l => ({label: l.nombre, value: l.id}));
  const opcionesEspecie = catalogo.especies.map(e => ({label: e.nombre, value: e.id}));
  const opcionesPlaga = catalogo.plagas.map((p: PlagaDto) => ({label: p.nombre, value: p.id}));

  const renderError = error ? (
    <ErrorState onRetry={() => id != null && cargarRequerimiento(id)} />
  ) : null;

  const renderAviso = avisoActa ? (
    <View accessibilityRole="alert" style={styles.notificacionError}>
      <Text style={styles.notificacionText}>{avisoActa}</Text>
    </View>
  ) : null;

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el formulario"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title={modo === 'crear' ? 'Nueva solicitud' : 'Editar solicitud'}
          showBack
          onBack={navigation.goBack}
        />
        {!isOnline && <OfflineBanner />}
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
            {loading || catalogo.loadingCatalogo ? (
              <LoadingState message="Cargando formulario…" />
            ) : renderError ? (
              renderError
            ) : (
              <>
                {renderAviso}
                <DateTimePickerField
                  label="Fecha"
                  value={fechaInput}
                  mode="date"
                  onChange={setFechaInput}
                  editable={camposBaseHabilitados}
                  accessibilityLabel="Fecha"
                />
                <SelectField
                  label="Fundo"
                  accessibilityLabel="Fundo"
                  optionAccessibilityPrefix="Opción Fundo"
                  value={
                    catalogo.fundos.find(f => f.id === fundoId)?.nombre ?? ''
                  }
                  options={opcionesFundo}
                  onSelect={cambiarFundo}
                  disabled={!camposBaseHabilitados || catalogo.fundos.length === 0}
                />
                <SelectField
                  label="Lote"
                  accessibilityLabel="Lote"
                  optionAccessibilityPrefix="Opción Lote"
                  value={catalogo.lotes.find(l => l.id === loteId)?.nombre ?? ''}
                  options={opcionesLote}
                  onSelect={v => setLoteId(Number(v))}
                  disabled={!camposBaseHabilitados || fundoId == null || catalogo.lotes.length === 0}
                />
                <SelectField
                  label="Especie"
                  accessibilityLabel="Especie"
                  optionAccessibilityPrefix="Opción Especie"
                  value={
                    catalogo.especies.find(e => e.id === especieId)?.nombre ?? ''
                  }
                  options={opcionesEspecie}
                  onSelect={v => setEspecieId(Number(v))}
                  disabled={!camposBaseHabilitados || catalogo.especies.length === 0}
                />
                <AppInput
                  label="Cantidad plaga (millares)"
                  value={cantidadTexto}
                  onChangeText={setCantidadTexto}
                  keyboardType="number-pad"
                  editable={camposBaseHabilitados}
                  maxLength={6}
                  accessibilityLabel="Cantidad plaga"
                />
                <SelectField
                  label="Objetivo (plaga)"
                  accessibilityLabel="Objetivo"
                  optionAccessibilityPrefix="Opción Plaga"
                  value={catalogo.plagas.find(p => p.id === plagaId)?.nombre ?? ''}
                  options={opcionesPlaga}
                  onSelect={v => setPlagaId(Number(v))}
                  disabled={!camposBaseHabilitados || catalogo.plagas.length === 0}
                />
                <View style={styles.estadoRow}>
                  <View style={styles.estadoFlex}>
                    <SelectField
                      label="Estado"
                      accessibilityLabel="Estado"
                      optionAccessibilityPrefix="Opción Estado"
                      value={estadoInfo(estado).label}
                      options={opcionesEstado}
                      onSelect={v => setEstado(v as EstadoRequerimiento)}
                      disabled={!estadoEditable}
                    />
                  </View>
                  <View style={styles.pdfButton}>
                    <AppButton
                      label="PDF"
                      icon="file-pdf-box"
                      variant="secondary"
                      onPress={() =>
                        setAvisoActa(
                          'Acta PDF: captura pendiente (el backend aún no soporta subir la evidencia).',
                        )
                      }
                      accessibilityLabel="Adjuntar acta PDF"
                    />
                  </View>
                </View>
                <DateTimePickerField
                  label="Fecha de liberación"
                  value={fechaLiberacionInput}
                  mode="date"
                  onChange={setFechaLiberacionInput}
                  onClear={() => setFechaLiberacionInput('')}
                  editable={camposBaseHabilitados}
                  accessibilityLabel="Fecha de liberación"
                />
                <DateTimePickerField
                  label="Hora de liberación"
                  value={horaLiberacion}
                  mode="time"
                  onChange={setHoraLiberacion}
                  onClear={() => setHoraLiberacion('')}
                  editable={camposBaseHabilitados}
                  accessibilityLabel="Hora de liberación"
                />
                <AppInput
                  label="Observaciones"
                  value={observaciones}
                  onChangeText={setObservaciones}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={camposBaseHabilitados}
                  accessibilityLabel="Observaciones"
                />

                <Text style={styles.subtitulo}>Presentaciones entregadas</Text>
                <AppInput
                  label="Papel con postura"
                  value={papelTexto}
                  onChangeText={setPapelTexto}
                  keyboardType="number-pad"
                  editable={papelSobreHabilitados}
                  maxLength={6}
                  accessibilityLabel="Papel con postura"
                />
                <AppInput
                  label="Sobre con cascarilla de arroz"
                  value={sobreTexto}
                  onChangeText={setSobreTexto}
                  keyboardType="number-pad"
                  editable={papelSobreHabilitados}
                  maxLength={6}
                  accessibilityLabel="Sobre con cascarilla"
                />
                {estado === 'ENTREGADO' ? (
                  <Text style={styles.ayuda}>
                    Si estado = Entregado, papel + sobre debe ser igual a la
                    cantidad para habilitar Guardar.
                  </Text>
                ) : null}

                <AppButton
                  label="Guardar"
                  icon="content-save-outline"
                  loading={saving}
                  disabled={!puedeGuardar}
                  onPress={guardar}
                  accessibilityLabel="Guardar solicitud"
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
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  },
  estadoFlex: {
    flex: 1,
  },
  pdfButton: {
    marginTop: theme.spacing[5],
    width: 72,
  },
  subtitulo: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  ayuda: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.status.warning,
    marginBottom: theme.spacing[3],
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
