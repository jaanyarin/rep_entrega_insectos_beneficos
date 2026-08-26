/**
 * usePhotoCapture — Hook compartido para captura/validación de fotos de evidencia.
 * Extraído de Screens 10 y 13 para eliminar duplicación (DRY — Ley 4).
 *
 * Maneja: cámara, galería, permisos, validación (tipo/tamaño/máximo),
 * estado local de fotos y limpieza.
 */

import {useCallback, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from 'react-native-image-picker';

export interface EvidencePhoto {
  uri: string;
  type: string;
  fileName: string;
  fileSize?: number;
}

const DEFAULT_MAX_PHOTOS = 2;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);

export function usePhotoCapture(maxPhotos = DEFAULT_MAX_PHOTOS) {
  const [fotos, setFotos] = useState<EvidencePhoto[]>([]);
  const [fotoError, setFotoError] = useState<string | null>(null);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Permiso para usar la cámara',
        message: 'Necesitamos la cámara para registrar la evidencia.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Cancelar',
      },
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    setFotoError(
      result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ? 'El permiso de cámara está bloqueado. Actívelo en Ajustes de la aplicación.'
        : 'Se necesita permiso de cámara para tomar la evidencia.',
    );
    return false;
  }, []);

  const agregarFoto = useCallback(
    (asset: Asset) => {
      setFotoError(null);
      if (fotos.length >= maxPhotos) {
        setFotoError(`Máximo ${maxPhotos} fotos permitidas`);
        return;
      }
      if (asset.type && !ACCEPTED_PHOTO_TYPES.has(asset.type)) {
        setFotoError('La evidencia debe estar en formato JPG o PNG.');
        return;
      }
      if (asset.fileSize != null && asset.fileSize > MAX_PHOTO_SIZE) {
        setFotoError('La evidencia no puede superar los 5 MB.');
        return;
      }
      setFotos(prev => [
        ...prev,
        {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `foto_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
        },
      ]);
    },
    [fotos.length, maxPhotos],
  );

  const tomarFoto = useCallback(async () => {
    setFotoError(null);
    if (fotos.length >= maxPhotos) {
      return;
    }
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }
    const result = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false,
      quality: 0.8,
    });
    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      if (result.errorMessage) {
        setFotoError(result.errorMessage);
      }
      return;
    }
    if (result.assets && result.assets.length > 0) {
      agregarFoto(result.assets[0]);
    }
  }, [fotos.length, maxPhotos, requestCameraPermission, agregarFoto]);

  const seleccionarFoto = useCallback(async () => {
    setFotoError(null);
    if (fotos.length >= maxPhotos) {
      return;
    }
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });
    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      if (result.errorMessage) {
        setFotoError(result.errorMessage);
      }
      return;
    }
    if (result.assets && result.assets.length > 0) {
      agregarFoto(result.assets[0]);
    }
  }, [fotos.length, maxPhotos, agregarFoto]);

  const quitarFoto = useCallback((index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const limpiarFotos = useCallback(() => {
    setFotos([]);
    setFotoError(null);
  }, []);

  return {
    fotos,
    fotoError,
    setFotoError,
    tomarFoto,
    seleccionarFoto,
    quitarFoto,
    limpiarFotos,
    requestCameraPermission,
  };
}
