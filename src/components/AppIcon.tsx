import {
  SymbolView,
  type AndroidSymbol,
  type SFSymbol,
  type SymbolViewProps,
} from 'expo-symbols';

export type AppIconName = {
  android: AndroidSymbol;
  ios: SFSymbol;
  web?: AndroidSymbol;
};

type AppIconProps = Omit<SymbolViewProps, 'name'> & {
  name: AppIconName;
};

/**
 * Uses SF Symbols on iOS and Material Symbols on Android/web.
 * Keeping the web fallback here prevents individual screens from silently
 * rendering an empty icon when only their Android and iOS names are supplied.
 */
export function AppIcon({ name, ...props }: AppIconProps) {
  return (
    <SymbolView
      {...props}
      name={{ android: name.android, ios: name.ios, web: name.web ?? name.android }}
    />
  );
}
