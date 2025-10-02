export const isDefined = <T>(value: T): value is Exclude<T, null | undefined> =>
  !!value || value === false || value === 0;

