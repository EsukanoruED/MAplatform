import { describe, expect, it, vi } from 'vitest';
import { ApiError, api } from './api';

/** The API client's two hard rules: always send credentials, never store a token. */
describe('api client', () => {
  it('sends credentials: include on every call', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ user: null }), { status: 200 }));
    globalThis.fetch = fetchMock;

    await api.getCurrentUser();
    await api.listRequests();
    await api.listEmployees();
    await api.logout();

    expect(fetchMock).toHaveBeenCalledTimes(4);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.credentials).toBe('include');
    }
  });

  it('throws a typed ApiError carrying the server code and message', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })) as unknown as typeof fetch;

    await expect(api.loginCompany('a@b.test', 'x')).rejects.toBeInstanceOf(ApiError);
    try {
      await api.loginCompany('a@b.test', 'x');
      expect.unreachable('should have thrown');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.code).toBe('INVALID_CREDENTIALS');
      expect(apiErr.message).toBe('Invalid email or password.');
      expect(apiErr.isUnauthenticated).toBe(true);
    }
  });

  it('turns a transport failure into a readable ApiError', async () => {
    globalThis.fetch = (async () => { throw new TypeError('Failed to fetch'); }) as unknown as typeof fetch;

    try {
      await api.getCurrentUser();
      expect.unreachable('should have thrown');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.code).toBe('NETWORK_ERROR');
      expect(apiErr.status).toBe(0);
    }
  });

  it('handles a non-JSON error body without throwing a parse error', async () => {
    globalThis.fetch = (async () =>
      new Response('<html>502 Bad Gateway</html>', { status: 502 })) as unknown as typeof fetch;

    await expect(api.listRequests()).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' });
  });

  it('never writes to localStorage or sessionStorage', async () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ user: { type: 'company' } }), { status: 200 })) as unknown as typeof fetch;

    await api.loginCompany('a@b.test', 'pw');
    await api.getCurrentUser();

    expect(localSpy).not.toHaveBeenCalled();
  });

  it('createRequest has no companyId parameter to pass', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ request: {} }), { status: 201 }));
    globalThis.fetch = fetchMock;

    await api.createRequest({ employeeId: 'emp-1', type: 'CHECKUP' });

    const body = String(fetchMock.mock.calls[0][1]?.body);
    expect(body).not.toMatch(/companyId/);
    expect(JSON.parse(body)).toEqual({ employeeId: 'emp-1', type: 'CHECKUP' });
  });

  it('builds the list query string from the given filters only', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ requests: [] }), { status: 200 }));
    globalThis.fetch = fetchMock;

    await api.listRequests({ status: 'AT_LAB' });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/requests?status=AT_LAB');
  });
});
