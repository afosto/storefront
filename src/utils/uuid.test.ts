import { afterEach, describe, expect, it, vi } from 'vitest';
import { uuid } from './uuid';

describe('uuid', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates to crypto.randomUUID', () => {
    const spy = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValue('11111111-1111-4111-8111-111111111111');

    expect(uuid()).toBe('11111111-1111-4111-8111-111111111111');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('returns a string in UUID shape', () => {
    expect(uuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
