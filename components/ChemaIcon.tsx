import React from 'react';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'react-native';

type IconName = 
  | 'decision'
  | 'outcome'
  | 'milestone'
  | 'review'
  | 'audit'
  | 'settings'
  | 'hilo';

interface ChemaIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const ICON_MAP = {
  decision: 'circle.hexagongrid',
  outcome: 'chart.line.uptrend.xyaxis',
  milestone: 'flag',
  review: 'calendar',
  audit: 'doc.text.magnifyingglass',
  settings: 'gearshape',
  hilo: 'circle'
} as const;

export default function ChemaIcon({ 
  name, 
  size = 16,
  color 
}: ChemaIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Subtle gray - matches concept
  const defaultColor = color || (isDark ? '#9CA3AF' : '#6B7280');
  
  return (
    <SymbolView
      name={ICON_MAP[name]}
      size={size}
      type="monochrome"
      tintColor={defaultColor}
      style={{ marginRight: 10 }}
    />
  );
}
