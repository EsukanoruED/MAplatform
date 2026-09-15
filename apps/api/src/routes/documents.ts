import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { validateParams } from '../middleware/validate';
import { getDocument, getDocumentForDownload } from '../services/documents';
import { getStorage } from '../services/storage';
import { documentIdParamsSchema } from '../validation/requests';
import type { DocumentIdParams } from '../validation/requests';

export const documentsRouter = Router();

/**
 * Document access for company users.
 *
 * TENANT ISOLATION: both handlers pass the session's companyId as the scope, and
 * Document carries its own denormalised `companyId`, so the tenant filter is a
 * plain column predicate rather than a join that could be forgotten. A foreign
 * document id resolves to no row and is reported as 404.
 */
documentsRouter.use(requireCompanyAuth);

/** GET /api/documents/:id — metadata only, no bytes. */
documentsRouter.get(
  '/:id',
  validateParams(documentIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as DocumentIdParams;

    const document = await getDocument(id, companyId);
    res.status(200).json({ document });
  }),
);

/**
 * GET /api/documents/:id/download — streams the stored bytes.
 *
 * This is the ONLY way document content leaves the server. The files live
 * outside the web app's public directory, so there is no URL that serves them
 * without passing through this authorisation check first.
 */
documentsRouter.get(
  '/:id/download',
  validateParams(documentIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as DocumentIdParams;

    // Throws before any key is known if the document is not this tenant's.
    const document = await getDocumentForDownload(id, companyId);

    res.setHeader('Content-Type', document.contentType);
    res.setHeader('Content-Length', String(document.byteSize));
    // `attachment` so a stored PDF or image is never rendered inline in the
    // portal's own origin; the filename is the sanitised one from upload time.
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.fileName.replace(/"/g, '')}"`,
    );
    // Clinical data: never cached by a shared proxy.
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = getStorage().createReadStream(document.storageKey);
    stream.on('error', (err) => {
      // Headers are already out by the time a stream error can happen, so the
      // only honest thing left is to log it and cut the response.
      req.log?.error({ err, documentId: document.id }, 'document stream failed');
      res.destroy(err);
    });
    stream.pipe(res);
  }),
);
