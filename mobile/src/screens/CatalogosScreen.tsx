import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import BottomNavigation from '../components/BottomNavigation';
import {theme} from '../theme';

export default function CatalogosScreen() {
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <AppHeader title="Catálogos" />
    <View style={styles.content}><Text style={styles.title}>Catálogos</Text><Text style={styles.text}>En construcción</Text></View>
    <BottomNavigation active="Catalogos" />
  </SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background.default},content:{flex:1,alignItems:'center',justifyContent:'center'},title:{fontFamily:theme.typography.h3.fontFamily,fontSize:theme.typography.h3.fontSize,color:theme.colors.text.primary},text:{fontFamily:theme.typography.body1.fontFamily,fontSize:theme.typography.body1.fontSize,color:theme.colors.text.secondary,marginTop:8}});
