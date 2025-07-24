type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as any;
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const k = key as keyof T;
      const sourceValue = source[k];

      if (typeof sourceValue === 'object' && sourceValue !== null) {
        result[k] = deepMerge(result[k] || {}, sourceValue);
      } else if (sourceValue !== undefined) {
        result[k] = sourceValue as any;
      }
    }
  }
  return result;
}
