import * as React from 'react';
import { Image, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

// Types for parsed HTML elements
type HtmlElement = {
  type: 'text' | 'element';
  tagName?: string;
  content?: string;
  attributes?: Record<string, string>;
  children?: HtmlElement[];
};

type HtmlRendererProps = {
  html: string;
  className?: string;
};

/**
 * Parse inline style attribute to extract color
 * Supports: color: rgb(r, g, b), color: #RRGGBB, color: #RGB
 */
function parseStyleColor(style: string): string | undefined {
  const colorMatch = style.match(/color\s*:\s*(rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|#[0-9a-fA-F]{3,6})/);
  if (!colorMatch) return undefined;

  const colorValue = colorMatch[1].trim();

  // Handle rgb(r, g, b) format
  const rgbMatch = colorValue.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Handle hex format
  return colorValue;
}

/**
 * Strip wrapper tags (html, head, body) from HTML string
 */
function stripWrapperTags(html: string): string {
  return html
    .replace(/<html[^>]*>/i, '')
    .replace(/<\/html>/i, '')
    .replace(/<head[^>]*>/i, '')
    .replace(/<\/head>/i, '')
    .replace(/<body[^>]*>/i, '')
    .replace(/<\/body>/i, '');
}

/**
 * AudioPlayer component for rendering HTML audio elements
 */
function AudioPlayer({ src, filename, duration }: { src: string; filename?: string; duration?: string }) {
  const player = useAudioPlayer(src);
  const status = useAudioPlayerStatus(player);

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const replay = () => {
    player.seekTo(0);
    player.play();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="border rounded-lg overflow-hidden bg-card my-4">
      <View className="bg-muted/50 px-4 py-3 border-b">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">🎵</Text>
          <View className="flex-1">
            <Text className="font-medium text-sm text-foreground">{filename || 'Audio'}</Text>
            {duration && <Text className="text-xs text-muted-foreground">{duration}</Text>}
          </View>
        </View>
      </View>
      <View className="p-4 flex-row items-center gap-3">
        <Button
          onPress={togglePlay}
          className="rounded-full w-12 h-12 items-center justify-center p-0"
          disabled={!status.isLoaded}
        >
          <Icon as={status.playing ? Pause : Play} size={20} className="text-primary-foreground" />
        </Button>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">
            {status.isLoaded ? formatTime(status.currentTime) : 'Loading...'} / {status.isLoaded ? formatTime(status.duration) : '--:--'}
          </Text>
        </View>
        <Button
          onPress={replay}
          variant="ghost"
          className="rounded-full w-10 h-10 items-center justify-center p-0"
          disabled={!status.isLoaded}
        >
          <Icon as={RotateCcw} size={16} className="text-foreground" />
        </Button>
      </View>
    </View>
  );
}

/**
 * Parse HTML string into a tree of HtmlElement nodes
 * Uses regex-based parsing for simplicity
 */
function parseHtml(html: string): HtmlElement[] {
  const stripped = stripWrapperTags(html);
  const elements: HtmlElement[] = [];

  // Check if it's plain text (no HTML tags)
  if (!stripped.includes('<')) {
    return [{ type: 'text', content: stripped }];
  }

  let remaining = stripped;
  let index = 0;

  while (remaining.length > 0) {
    // Find the next opening tag
    const openTagMatch = remaining.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/);
    
    if (!openTagMatch) {
      // No more tags, add remaining as text
      if (remaining.trim()) {
        elements.push({ type: 'text', content: remaining });
      }
      break;
    }

    const [fullTag, tagName, attributesStr] = openTagMatch;
    const tagStartIndex = remaining.indexOf(fullTag);

    // Add text before the tag
    if (tagStartIndex > 0) {
      const textContent = remaining.substring(0, tagStartIndex);
      if (textContent.trim()) {
        elements.push({ type: 'text', content: textContent });
      }
    }

    // Parse attributes
    const attributes: Record<string, string> = {};
    if (attributesStr) {
      const attrRegex = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
      }
    }

    // Find the closing tag
    const closingTag = `</${tagName}>`;
    const closingTagIndex = remaining.indexOf(closingTag, tagStartIndex + fullTag.length);

    if (closingTagIndex === -1) {
      // Self-closing tag (like <img />)
      if (fullTag.endsWith('/>')) {
        elements.push({
          type: 'element',
          tagName,
          attributes,
          children: [],
        });
      } else {
        // Malformed HTML, treat as text
        elements.push({ type: 'text', content: remaining });
      }
      break;
    }

    // Extract content between tags
    const content = remaining.substring(tagStartIndex + fullTag.length, closingTagIndex);

    // Recursively parse children
    const children = parseHtml(content);

    elements.push({
      type: 'element',
      tagName,
      attributes,
      children,
    });

    // Move past the closing tag
    remaining = remaining.substring(closingTagIndex + closingTag.length);
  }

  return elements;
}

/**
 * Render a single HTML element as React Native components
 */
function renderElement(element: HtmlElement, key: string): React.ReactNode {
  if (element.type === 'text') {
    return (
      <Text key={key} className="text-foreground">
        {element.content}
      </Text>
    );
  }

  const { tagName, attributes, children } = element;

  switch (tagName?.toLowerCase()) {
    case 'p': {
      return (
        <View key={key} style={{ marginBottom: 8 }}>
          {children?.map((child, i) => renderElement(child, `${key}-p-${i}`))}
        </View>
      );
    }

    case 'img': {
      const src = attributes?.src;
      const className = attributes?.class || '';
      
      if (!src) return null;

      // Parse classes for styling
      const hasRounded = className.includes('rounded-lg');
      const hasBorder = className.includes('border');
      const hasMutedBorder = className.includes('border-muted');

      const imageStyle: ImageStyle = {
        borderRadius: hasRounded ? 8 : 0,
        borderWidth: hasBorder ? 1 : 0,
        borderColor: hasMutedBorder ? '#e5e7eb' : undefined,
        resizeMode: 'contain',
        maxWidth: '100%',
        height: 200,
      };

      return (
        <Image
          key={key}
          source={{ uri: src }}
          style={imageStyle}
        />
      );
    }

    case 'audio': {
      const src = attributes?.src;
      const filename = attributes?.['data-filename'];
      const duration = attributes?.['data-duration'];
      
      if (!src) return null;

      return <AudioPlayer key={key} src={src} filename={filename} duration={duration} />;
    }

    case 'span': {
      const style = attributes?.style || '';
      const color = parseStyleColor(style);

      const textStyle: TextStyle = {};
      if (color) {
        textStyle.color = color;
      }

      return (
        <Text key={key} style={textStyle} className="text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-span-${i}`))}
        </Text>
      );
    }

    case 'strong':
    case 'b': {
      return (
        <Text key={key} className="font-bold text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-strong-${i}`))}
        </Text>
      );
    }

    case 'em':
    case 'i': {
      return (
        <Text key={key} className="italic text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-em-${i}`))}
        </Text>
      );
    }

    case 'u': {
      return (
        <Text key={key} className="underline text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-u-${i}`))}
        </Text>
      );
    }

    default: {
      // Unknown tag, render children
      return (
        <React.Fragment key={key}>
          {children?.map((child, i) => renderElement(child, `${key}-unknown-${i}`))}
        </React.Fragment>
      );
    }
  }
}

/**
 * HtmlRenderer - A simple HTML renderer for React Native
 *
 * Parses HTML content and renders it using React Native components.
 * Supports: p, img, audio, span, strong, b, em, i, u
 * Handles inline styles for color
 * Strips wrapper tags (html, head, body)
 *
 * @example
 * <HtmlRenderer html="<p>Hello <strong>world</strong></p>" />
 */
export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  const elements = parseHtml(html);

  return (
    <View className={className}>
      {elements.map((element, index) => renderElement(element, `html-${index}`))}
    </View>
  );
}
