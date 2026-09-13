import { describe, expect, it } from 'vitest';
import { BCRYPT_COST, hashPassword, normalizeEmail, verifyPassword } from '../src/services/auth';

describe('password hashing', () => {
  it('produces a bcrypt hash, never the plaintext', async () => {
    const hash = await hashPassword('CorrectHorse1!');
    expect(hash).not.toBe('CorrectHorse1!');
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toContain('CorrectHorse1!');
  });

  it('salts: the same password hashes differently each time', async () => {
    const [a, b] = await Promise.all([hashPassword('SamePassword1!'), hashPassword('SamePassword1!')]);
    expect(a).not.toBe(b);
  });

  it('rejects an empty password rather than hashing it', async () => {
    await expect(hashPassword('')).rejects.toThrow();
  });

  it('uses a reduced cost factor only under NODE_ENV=test', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(BCRYPT_COST).toBe(4);
  });
});

describe('password verification', () => {
  it('accepts the correct password', async () => {
    const hash = await hashPassword('CorrectHorse1!');
    await expect(verifyPassword('CorrectHorse1!', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('CorrectHorse1!');
    await expect(verifyPassword('correcthorse1!', hash)).resolves.toBe(false);
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('returns false rather than throwing for a malformed or missing hash', async () => {
    await expect(verifyPassword('anything', 'not-a-bcrypt-hash')).resolves.toBe(false);
    await expect(verifyPassword('anything', '')).resolves.toBe(false);
  });
});

describe('email normalisation', () => {
  it('trims and lower-cases so one address maps to one account', () => {
    expect(normalizeEmail('  Ops@Example.COM ')).toBe('ops@example.com');
  });
});
