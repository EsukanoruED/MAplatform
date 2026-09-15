import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../env';
import { ValidationError } from '../lib/errors';
import { isAllowedContentType } from '../services/storage';

/**
 * Multipart parsing for document uploads.
 *
 * Deliberately `memoryStorage`: multer never writes a caller-controlled file to
 * disk. The bytes stay in a Buffer until services/documents.ts has validated
 * ownership, content type and size, and only then are they written under a
 * server-generated key. Nothing ever lands in a public directory.
 *
 * Three limits are enforced at the parser, before the body is fully buffered:
 * file size, one file per request, and a small cap on accompanying text fields.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.storage.maxUploadBytes,
    files: 1,
    fields: 8,
    fieldSize: 4096,
  },
  fileFilter: (_req, file, callback) => {
    // First gate on content type. services/documents.ts re-checks authoritatively;
    // rejecting here avoids buffering a file that can never be stored.
    if (!isAllowedContentType(file.mimetype)) {
      callback(
        new ValidationError(
          `Files of type "${file.mimetype}" are not accepted. Allowed: PDF, PNG, JPEG, WebP, plain text.`,
          [{ path: 'file', message: 'Unsupported file type.' }],
        ),
      );
      return;
    }
    callback(null, true);
  },
});

/**
 * Accepts exactly one file on the `file` field and translates multer's own
 * errors into the platform's `{ error: { code, message } }` shape, so an
 * oversized upload returns a clean 400 instead of a raw MulterError.
 */
export function singleDocumentUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Files must be ${Math.floor(env.storage.maxUploadBytes / 1024 / 1024)} MB or smaller.`
          : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Upload exactly one file, on the "file" field.'
            : 'The upload could not be processed.';
      next(new ValidationError(message, [{ path: 'file', message }]));
      return;
    }
    next(err);
  });
}
