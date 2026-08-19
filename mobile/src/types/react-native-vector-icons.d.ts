declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import type {ComponentType} from 'react';
  import type {TextStyle} from 'react-native';

  interface MaterialCommunityIconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    accessibilityLabel?: string;
  }

  const MaterialCommunityIcons: ComponentType<MaterialCommunityIconProps>;
  export default MaterialCommunityIcons;
}