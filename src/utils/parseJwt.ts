const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

/**
 * Decode the payload of a JWT, without verifying it.
 * Returns null for a missing or malformed token instead of throwing.
 */
export const parseJwt = (token?: string | null): Record<string, any> | null => {
  const payload = token?.split('.')[1];

  if (!payload) {
    return null;
  }

  try {
    const decoded: unknown = JSON.parse(decodeBase64Url(payload));

    return decoded && typeof decoded === 'object' && !Array.isArray(decoded)
      ? (decoded as Record<string, any>)
      : null;
  } catch {
    return null;
  }
};
