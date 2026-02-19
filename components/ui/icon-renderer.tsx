import React from 'react';
import { Icon as LucideIconWrapper } from '@/components/ui/icon';
import * as LucideIcons from 'lucide-react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '@/components/ui/text';

interface IconRendererProps {
  iconName?: string;
  size?: number;
  className?: string;
}

export function IconRenderer({ iconName, size = 24, className }: IconRendererProps) {
  if (!iconName) return null;

  // 1. Parse FontAwesome (e.g., "FaBookOpen" or "fa-book-open")
  // Using FontAwesome5 as the default for FA icons
  if (iconName.toLowerCase().startsWith('fa')) {
    // Remove 'Fa' or 'fa-' prefix
    let name = iconName.replace(/^(Fa|fa-?)/i, '');
    // Convert PascalCase to kebab-case (e.g., BookOpen -> book-open)
    name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    
    return <FontAwesome5 name={name} size={size} />;
  }

  // 2. Parse Material Icons (e.g., "MdHome" or "md-home")
  if (iconName.toLowerCase().startsWith('md')) {
     let name = iconName.replace(/^(Md|md-?)/i, '');
     name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
     return <MaterialIcons name={name} size={size} />;
  }

   // 3. Parse Ionicons (e.g., "IoHome" or "io-home")
   if (iconName.toLowerCase().startsWith('io')) {
    let name = iconName.replace(/^(Io|io-?)/i, '');
    name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return <Ionicons name={name} size={size} />;
 }

  // 4. Fallback to Lucide Icons (e.g. "BookOpen")
  // Lucide icon names are typically PascalCase in the library exports
  const LucideIcon = (LucideIcons as any)[iconName];
  if (LucideIcon) {
    return <LucideIconWrapper as={LucideIcon} size={size} className={className} />;
  }
  
  // 5. Final fallback: render nothing or a generic icon if needed
  // For now, let's try to render it as text if all else fails, assuming it might be a weird emoji or text
  return <Text style={{ fontSize: size }}>{iconName}</Text>;
}
