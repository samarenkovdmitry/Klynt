export function getRecommendedVariant<T>(
  variants: readonly (T & { recommended?: boolean })[] | undefined
): T | undefined {
  if (!variants || variants.length === 0) return undefined;
  return variants.find((v) => v.recommended === true) ?? variants[0];
}
