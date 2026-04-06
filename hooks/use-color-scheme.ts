import { useThemeController } from './theme-context';

export function useColorScheme() {
  const { colorScheme } = useThemeController();
  return colorScheme;
}
