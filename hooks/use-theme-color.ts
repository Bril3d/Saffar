/**
 * Simplified for SAFAR's dark-first design system.
 * Returns color from props if provided, otherwise from theme.
 */

import { colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: string
) {
  // For backward compat, return prop if provided, else return primary text
  if (props.light || props.dark) {
    return props.light ?? props.dark ?? colors.text.primary;
  }
  return colors.text.primary;
}
