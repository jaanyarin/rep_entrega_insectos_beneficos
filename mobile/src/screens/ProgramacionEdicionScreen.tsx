/**
 * ProgramacionEdicionScreen — Screen 5: Edición de Programación (MOD-17).
 *
 * Descripción (01_especificacion.md RF-141..146 / transcripcion.md):
 *  1. Filtro de mes: selectores mes + año (chevrons) para elegir el periodo.
 *  2. Filtro de especie: píldoras con el catálogo de especies.
 *  3. Tabla de proyección final editable: por semana — Papel con postura y
 *     Sobre con cascarilla editables (millares); Total = suma automática
 *     (RF-134); Stock inicial y Stock final mostrados (los computa el
 *     backend, incluyendo remanente RN-037/RF-188).
 *  4. Botón "Enviar stock": guarda (PUT) y publica (POST /publicar)
 *     notificando por correo a Sanidad (RF-145/146).
 *
 * Restricciones:
 *  - Edición SOLO lunes y jueves 00:00-23:59 (RF-147/148): fuera de esos
 *    días los inputs y "Enviar stock" quedan deshabilitados.
 *  - Una programación PUBLICADA (RN-038) no vuelve a editarse.
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import AppIconButton from '../components/AppIconButton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusChip from '../components/StatusChip';
import type {RootStackParamList} from '../navigation/types';
import {
  actualizarProgramacion,
  crearProgramacion,
  extractErrorMessage,
  listarEspecies,
  listarProgramaciones,
  obtenerProgramacion,
  publicarProgramacion,
  type EspecieDto,
  type ProgramacionDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {
  anioActual,
  esDiaEditable,
  etiquetaPeriodo,
  formatFecha,
  mesActual,
} from '../utils/programacion';

type Route = RouteProp<RootStackParamList, 'ProgramacionEdicion'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Fila editable de la tabla semanal (strings para los inputs numéricos). */
interface FilaEditable {
  detalleId: number;
  semana: number;
  fecha: string;
  stockInicial: number;
  papel: string;
  sobre: string;
}

const soloNumeros = (texto: string) => texto.replace(/[^0-9]/g, '');

/** Valor numérico seguro (vacío → 0). */
function aNumero(texto: string): number {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 0 : n;
}

export default function ProgramacionEdicionScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  // Extraer params: modo puede ser 'crear' o 'editar' (por defecto 'editar')
  const params = route.params;
  const modo: 'crear' | 'editar' = params.modo ?? 'editar';
  const idInicial = 'id' in params ? params.id : undefined;
  const anioInicial = params.anio;
  const mesInicial = params.mes;

  const [anio, setAnio] = useState(anioInicial ?? anioActual());
  const [mes, setMes] = useState(mesInicial ?? mesActual());
  const [especies, setEspecies] = useState<EspecieDto[]>([]);
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [programacion, setProgramacion] = useState<ProgramacionDto | null>(null);
  const [filas, setFilas] = useState<FilaEditable[]>([]);
  const [loading, setLoading] = useState(modo === 'editar'); // En modo 'crear' no hay carga inicial
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    tipo: 'ok' | 'error';
    texto: string;
  } | null>(null);

  const puedeEditar =
    esDiaEditable() && programacion?.estado === 'EN_PROCESO';

  /** Carga el catálogo de especies una única vez (montaje). */
  useEffect(() => {
    let activo = true;
    listarEspecies()
      .then(es => {
        if (activo) {
          setEspecies(es);
        }
      })
      .catch(() => {
        // El error de catálogo se refleja en el flujo principal de carga.
      });
    return () => {
      activo = false;
    };
  }, []);

  /**
   * Carga la programación en edición: primero el detalle completo del id
   * inicial (para no esperar el listado) y sincroniza mes/especie. Luego, al
   * cambiar los filtros, se busca la programación del periodo + especie.
   */
  const cargarDetalle = useCallback(async (targetId: number) => {
    setLoading(true);
    setError(null);
    try {
      const detalle = await obtenerProgramacion(targetId);
      setProgramacion(detalle);
      setAnio(detalle.anio);
      setMes(detalle.mes);
      setEspecieId(detalle.especieId);
      setFilas(
        (detalle.detalles ?? []).map(d => ({
          detalleId: d.id,
          semana: d.semana,
          fecha: d.fecha,
          stockInicial: d.stockInicial,
          papel: String(d.papelConPostura),
          sobre: String(d.sobreConCascarilla),
        })),
      );
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Solo cargar detalle en modo 'editar' con id válido
    if (modo === 'editar' && idInicial) {
      cargarDetalle(idInicial);
    }
  }, [idInicial, cargarDetalle, modo]);

  /** Al cambiar mes/anio/especie: busca la programación de ese periodo. */
  const seleccionarProgramacionDelPeriodo = useCallback(
    async (mesSel: number, anioSel: number, especieSel: number | null) => {
      setLoading(true);
      setError(null);
      try {
        const lista = await listarProgramaciones(anioSel, mesSel);
        const coincidencia = lista.find(p => p.especieId === especieSel);
        if (coincidencia) {
          await cargarDetalle(coincidencia.id);
        } else {
          setProgramacion(null);
          setFilas([]);
          setLoading(false);
        }
      } catch (e) {
        setError(extractErrorMessage(e));
        setLoading(false);
      }
    },
    [cargarDetalle],
  );

  const cambiarPeriodo = (mesSel: number, anioSel: number) => {
    setMes(mesSel);
    setAnio(anioSel);
    seleccionarProgramacionDelPeriodo(mesSel, anioSel, especieId);
  };

  const cambiarEspecie = (id: number) => {
    setEspecieId(id);
    seleccionarProgramacionDelPeriodo(mes, anio, id);
  };

  const moverMes = (delta: number) => {
    const total = mes - 1 + delta;
    const nuevoAnio = anio + Math.floor(total / 12);
    const nuevoMes = ((total % 12) + 12) % 12 + 1;
    cambiarPeriodo(nuevoMes, nuevoAnio);
  };

  /** Filas con total y stock final computados (remanente visual RN-037). */
  const filasComputadas = useMemo(
    () =>
      filas.map((f, idx) => {
        const papelNum = aNumero(f.papel);
        const sobreNum = aNumero(f.sobre);
        const total = papelNum + sobreNum;
        const anterior = filas[idx - 1];
        const stockInicial =
          idx === 0
            ? f.stockInicial
            : anterior.stockInicial -
              aNumero(anterior.papel) -
              aNumero(anterior.sobre);
        const stockFinal = stockInicial - total;
        return {...f, papelNum, sobreNum, total, stockInicial, stockFinal};
      }),
    [filas],
  );

  const totalMes = useMemo(
    () => filasComputadas.reduce((acc, f) => acc + f.total, 0),
    [filasComputadas],
  );

  const actualizarFila = (
    detalleId: number,
    campo: 'papel' | 'sobre',
    valor: string,
  ) => {
    const limpio = soloNumeros(valor);
    setFilas(prev =>
      prev.map(f =>
        f.detalleId === detalleId ? {...f, [campo]: limpio} : f,
      ),
    );
  };

  const enviarStock = async () => {
    if (!programacion) {
      return;
    }
    setSaving(true);
    setNotificacion(null);
    try {
      await actualizarProgramacion(programacion.id, {
        stockInicialBase: programacion.stockInicialBase,
        detalles: filas.map(f => ({
          id: f.detalleId,
          semana: f.semana,
          fecha: f.fecha,
          papelConPostura: aNumero(f.papel),
          sobreConCascarilla: aNumero(f.sobre),
        })),
      });
      const res = await publicarProgramacion(programacion.id);
      setNotificacion({
        tipo: 'ok',
        texto:
          res.mensaje ||
          'Programación publicada. Se notificó a Sanidad por correo.',
      });
      await cargarDetalle(programacion.id);
    } catch (e) {
      setNotificacion({tipo: 'error', texto: extractErrorMessage(e)});
    } finally {
      setSaving(false);
    }
  };

  /** Crea una nueva programacion (modo 'crear') y navega al modo 'editar'. */
  const crearNuevaProgramacion = async () => {
    if (!especieId) {
      setNotificacion({tipo: 'error', texto: 'Selecciona una especie'});
      return;
    }
    setSaving(true);
    setNotificacion(null);
    try {
      const nueva = await crearProgramacion({
        anio,
        mes,
        especieId,
      });
      setNotificacion({
        tipo: 'ok',
        texto: 'Programación creada. Ahora puedes editarla.',
      });
      // Navegar al modo 'editar' con el id creado (replace para no acumular en stack)
      navigation.replace('ProgramacionEdicion', {
        id: nueva.id,
        anio: nueva.anio,
        mes: nueva.mes,
        modo: 'editar',
      });
    } catch (e) {
      setNotificacion({tipo: 'error', texto: extractErrorMessage(e)});
    } finally {
      setSaving(false);
    }
  };

  const renderPeriodo = (
    <View style={styles.periodRow}>
      <AppIconButton
        name="chevron-left"
        accessibilityLabel="Mes anterior"
        onPress={() => moverMes(-1)}
      />
      <Text style={styles.periodLabel}>{etiquetaPeriodo(mes, anio)}</Text>
      <AppIconButton
        name="chevron-right"
        accessibilityLabel="Mes siguiente"
        onPress={() => moverMes(1)}
      />
    </View>
  );

  const renderEspecies = (
    <View>
      <Text style={styles.sectionTitle}>Especie</Text>
      <View style={styles.pills}>
        {especies.map(es => {
          const activo = especieId === es.id;
          return (
            <Pressable
              key={es.id}
              accessibilityRole="button"
              accessibilityLabel={`Especie ${es.nombre}`}
              accessibilityState={{selected: activo}}
              onPress={() => cambiarEspecie(es.id)}
              style={[styles.pill, activo && styles.pillActive]}>
              <Text style={[styles.pillText, activo && styles.pillTextActive]}>
                {es.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderNotificacion = notificacion ? (
    <View
      accessibilityRole="alert"
      style={[
        styles.notification,
        notificacion.tipo === 'error' && styles.notificationError,
      ]}>
      <Text style={styles.notificationText}>{notificacion.texto}</Text>
    </View>
  ) : null;

  const renderTabla = () => {
    const chipEstado = (estado: ProgramacionDto['estado']) =>
      estado === 'PUBLICADO' ? (
        <StatusChip tone="approved" label="Publicado" />
      ) : (
        <StatusChip tone="pending" label="En proceso" />
      );

    return (
      <View>
        <View style={styles.tablaHeader}>
          <Text style={[styles.colSemana, styles.tablaHeaderText]}>Sem</Text>
          <Text style={[styles.colFecha, styles.tablaHeaderText]}>Fecha</Text>
          <Text style={[styles.colInput, styles.tablaHeaderText]}>Papel</Text>
          <Text style={[styles.colInput, styles.tablaHeaderText]}>Sobre</Text>
          <Text style={[styles.colNum, styles.tablaHeaderText]}>Total</Text>
          <Text style={[styles.colNum, styles.tablaHeaderText]}>F.</Text>
        </View>
        {filasComputadas.map((f) => (
          <View key={f.detalleId} style={styles.tablaFila}>
            <Text style={[styles.colSemana, styles.tablaCell]}>{f.semana}</Text>
            <Text style={[styles.colFecha, styles.tablaCell]}>
              {formatFecha(f.fecha)}
            </Text>
            <TextInput
              style={[styles.colInput, styles.inputCelda]}
              value={f.papel}
              keyboardType="number-pad"
              editable={puedeEditar}
              maxLength={6}
              onChangeText={v => actualizarFila(f.detalleId, 'papel', v)}
              accessibilityLabel={`Papel semana ${f.semana}`}
            />
            <TextInput
              style={[styles.colInput, styles.inputCelda]}
              value={f.sobre}
              keyboardType="number-pad"
              editable={puedeEditar}
              maxLength={6}
              onChangeText={v => actualizarFila(f.detalleId, 'sobre', v)}
              accessibilityLabel={`Sobre semana ${f.semana}`}
            />
            <Text style={[styles.colNum, styles.tablaCell]}>{f.total}</Text>
            <Text style={[styles.colNum, styles.tablaCell]}>{f.stockFinal}</Text>
          </View>
        ))}
        <View style={styles.tablaPie}>
          <Text style={styles.totalMes}>
            Total del mes: <Text style={styles.totalMesBold}>{totalMes} millares</Text>
          </Text>
          {programacion ? chipEstado(programacion.estado) : null}
        </View>
        {!esDiaEditable() ? (
          <Text style={styles.avisoEdicion}>
            La edición solo está permitida los lunes y jueves de 00:00 a 23:59.
          </Text>
        ) : null}
        {programacion?.estado === 'PUBLICADO' ? (
          <Text style={styles.avisoEdicion}>
            Esta programación ya fue publicada y no puede volver a editarse.
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo editar la programación"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title={modo === 'crear' ? 'Nueva programación' : 'Editar programación'}
          showBack
          onBack={navigation.goBack}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: 32 + insets.bottom},
          ]}>
          {renderPeriodo}
          {renderNotificacion}
          {modo === 'crear' ? (
            // MODO CREAR: formulario con selector de especie y botón "Crear"
            <>
              {renderEspecies}
              {!esDiaEditable() ? (
                <Text style={styles.avisoEdicion}>
                  La creación solo está permitida los lunes y jueves de 00:00 a 23:59.
                </Text>
              ) : null}
              <AppButton
                label="Crear programación"
                icon="plus"
                loading={saving}
                disabled={!especieId || !esDiaEditable()}
                onPress={crearNuevaProgramacion}
                accessibilityLabel="Crear nueva programación"
              />
            </>
          ) : error ? (
            <ErrorState onRetry={() => idInicial && cargarDetalle(idInicial)} />
          ) : loading ? (
            <LoadingState message="Cargando programación…" />
          ) : programacion ? (
            <>
              {renderEspecies}
              <Text style={styles.sectionTitle}>Proyección del mes</Text>
              {renderTabla()}
              <AppButton
                label="Enviar stock"
                icon="send-outline"
                loading={saving}
                disabled={!puedeEditar}
                onPress={enviarStock}
                accessibilityLabel="Enviar stock"
              />
            </>
          ) : (
            <EmptyState
              title="Sin programación para este periodo y especie"
              message="Selecciona otro mes o especie para continuar la edición."
              icon="calendar-blank-outline"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  periodLabel: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  pill: {
    paddingHorizontal: theme.spacing[4],
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: theme.colors.action.secondary,
    borderColor: theme.colors.action.secondary,
  },
  pillText: {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  pillTextActive: {
    color: theme.colors.text.inverse,
  },
  notification: {
    backgroundColor: theme.colors.status.successBackground,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
  },
  notificationError: {
    backgroundColor: theme.colors.status.errorBackground,
  },
  notificationText: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.primary,
  },
  avisoEdicion: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.status.warning,
    marginTop: theme.spacing[2],
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  tablaHeaderText: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  tablaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: theme.spacing[1],
  },
  tablaCell: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.primary,
  },
  colSemana: {
    width: 30,
  },
  colFecha: {
    flex: 1,
  },
  colInput: {
    width: 52,
  },
  colNum: {
    width: 42,
    textAlign: 'right',
  },
  inputCelda: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing[1],
    paddingVertical: theme.spacing[1],
    minHeight: 36,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.paper,
    textAlign: 'right',
  },
  tablaPie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[2],
  },
  totalMes: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  totalMesBold: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    color: theme.colors.text.primary,
  },
});