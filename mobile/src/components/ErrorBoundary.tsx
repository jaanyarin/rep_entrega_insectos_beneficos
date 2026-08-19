/**
 * ErrorBoundary — Componente de clase propio (sin dependencias) que captura
 * errores de renderizado de pantallas hijas y muestra ErrorState (V8: Perfil
 * usa componentes PROPIOS del design system, sin react-native-paper).
 *
 * - `hasError` se resetea con el botón "Reintentar".
 * - En dev loguea el error al console (no bloquea la UI).
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {theme} from '../theme';
import ErrorState from './ErrorState';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.warn('[ErrorBoundary] Error de renderizado:', error.message);
    }
  }

  private handleRetry = () => {
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ErrorState
            title={this.props.fallbackTitle ?? 'Ocurrió un error inesperado'}
            message={
              this.props.fallbackMessage ??
              'La pantalla no pudo renderizarse correctamente. Inténtalo nuevamente.'
            }
            retryLabel="Reintentar"
            onRetry={this.handleRetry}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
});