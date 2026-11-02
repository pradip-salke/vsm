import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  const requestId = req.requestId;
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON', requestId } });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.issues.map(({ path, message }) => ({ path, message })), requestId } });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, requestId } });
    return;
  }
  if (error && typeof error === 'object' && 'status' in error && error.status === 503) {
    res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'A required service is unavailable', requestId } });
    return;
  }
  console.error(JSON.stringify({ level: 'error', requestId, name: error instanceof Error ? error.name : 'UnknownError', code: error && typeof error === 'object' && 'code' in error ? error.code : undefined }));
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', requestId } });
};
