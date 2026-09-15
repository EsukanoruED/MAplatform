import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { env } from '../env';
import { ValidationError } from '../lib/errors';

/**
 * Storage abstraction for Document bytes.
 *
 * Phase 2 ships one implementation — LocalDiskStorage — so the document flow can
 * be built and tested end to end before object storage is provisioned. Swapping
 * in S3/GCS later means implementing this interface and changing the factory at
 * the bottom of this file; nothing in the routes or services changes.
 *
 * DEVELOPMENT LIMITATION: local disk is per-instance and not replicated. It is
 * not suitable for production or for more than one API instance. The Phase 6
 * infrastructure work replaces it with object storage.
 */
export interface StorageAdapter {
  readonly name: string;
  /** Persists bytes under a server-generated key and returns that key. */
  put(input: { key: string; body: Buffer; contentType: string }): Promise<void>;
  /** Opens a stream for an authorised download. */
  createReadStream(key: string): Readable;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

/**
 * Content types a document may have. An allow-list, not a block-list: anything
 * not named here is refused rather than stored and hoped about.
 *
 * Deliberately excludes SVG (scriptable) and every active/executable type.
 */
export const ALLOWED_CONTENT_TYPES: Readonly<Record<string, string>> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'text/plain': 'txt',
};

export function isAllowedContentType(contentType: string): boolean {
  return Object.hasOwn(ALLOWED_CONTENT_TYPES, normaliseContentType(contentType));
}

/** Strips any `; charset=…` parameter and lower-cases the media type. */
export function normaliseContentType(contentType: string): string {
  return (contentType ?? '').split(';')[0].trim().toLowerCase();
}

/**
 * Builds the opaque storage key. The client's filename NEVER becomes a path:
 * the key is companyId/requestId/uuid.ext, so a crafted filename such as
 * "../../etc/passwd" cannot escape the storage root or collide with another
 * tenant's object.
 */
export function buildStorageKey(input: {
  companyId: string;
  requestId: string;
  contentType: string;
}): string {
  const extension = ALLOWED_CONTENT_TYPES[normaliseContentType(input.contentType)] ?? 'bin';
  return `${input.companyId}/${input.requestId}/${randomUUID()}.${extension}`;
}

export function checksumOf(body: Buffer): string {
  return createHash('sha256').update(body).digest('hex');
}

/** Rejects a key that would resolve outside the storage root. */
function assertSafeKey(key: string): void {
  if (!key || key.includes('..') || path.isAbsolute(key)) {
    throw new ValidationError('Invalid storage key.');
  }
}

export class LocalDiskStorage implements StorageAdapter {
  readonly name = 'local';
  private readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  private resolve(key: string): string {
    assertSafeKey(key);
    const full = path.resolve(this.root, key);
    // Belt and braces: even with a sanitised key, confirm the resolved path is
    // inside the root before touching the filesystem.
    if (!full.startsWith(path.resolve(this.root) + path.sep)) {
      throw new ValidationError('Invalid storage key.');
    }
    return full;
  }

  async put({ key, body }: { key: string; body: Buffer; contentType: string }): Promise<void> {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body, { flag: 'wx' });
  }

  createReadStream(key: string): Readable {
    return createReadStream(this.resolve(key));
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(this.resolve(key));
  }

  async remove(key: string): Promise<void> {
    const full = this.resolve(key);
    if (existsSync(full)) await unlink(full);
  }
}

let cached: StorageAdapter | undefined;

/** The configured adapter. Only 'local' is implemented in Phase 2. */
export function getStorage(): StorageAdapter {
  if (cached) return cached;
  if (env.storage.driver !== 'local') {
    throw new Error(
      `Unsupported STORAGE_DRIVER "${env.storage.driver}". Phase 2 implements only "local".`,
    );
  }
  cached = new LocalDiskStorage(env.storage.localDir);
  return cached;
}

/** Test seam — lets a suite swap in an in-memory adapter. */
export function setStorage(adapter: StorageAdapter | undefined): void {
  cached = adapter;
}
