import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { APP_ENVIRONMENT } from '@env/environment.token';
import type { InventoryItem, InventoryItemInput } from '@features/estoque/data-access/inventory.models';
import { MOCK_CREDENTIALS, MOCK_ITEMS, MOCK_TOKEN, MOCK_USER } from './mock-data';

const LATENCY_MS = 350;

/** "Banco" em memória: reinicia a cada recarga da página. */
let items: InventoryItem[] = structuredClone([...MOCK_ITEMS]);

/**
 * Backend simulado para rodar o exemplo sem servidor.
 * Ativado por `features.mockBackend` no environment; responde apenas às URLs de `api.baseUrl`.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const baseUrl = env.api.baseUrl;
  if (!env.features.mockBackend || !req.url.startsWith(baseUrl)) {
    return next(req);
  }
  const path = req.url.slice(baseUrl.length);
  return timer(LATENCY_MS).pipe(switchMap(() => route(req, path)));
};

function route(req: HttpRequest<unknown>, path: string): Observable<HttpEvent<unknown>> {
  if (req.method === 'POST' && path === '/auth/login') {
    return signIn(req.body as { email?: string; password?: string });
  }
  if (req.method === 'POST' && path === '/auth/password-recovery') {
    return ok(null, 204);
  }
  if (path.startsWith('/estoque/itens')) {
    if (req.headers.get('Authorization') !== `Bearer ${MOCK_TOKEN}`) {
      return fail(req, 401);
    }
    const id = path.split('/')[3];
    return id ? itemRoute(req, decodeURIComponent(id)) : collectionRoute(req);
  }
  return fail(req, 404);
}

function signIn(body: { email?: string; password?: string }): Observable<HttpEvent<unknown>> {
  const valid = body.email === MOCK_CREDENTIALS.email && body.password === MOCK_CREDENTIALS.password;
  return valid
    ? ok({ token: MOCK_TOKEN, user: MOCK_USER })
    : throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
}

function collectionRoute(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  if (req.method === 'GET') {
    const term = (req.params.get('q') ?? '').toLowerCase();
    if (term === 'erro500') {
      return fail(req, 500);
    }
    const result = items.filter(
      (item) => item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term),
    );
    return ok(result);
  }
  if (req.method === 'POST') {
    const input = req.body as InventoryItemInput;
    if (skuTaken(input.sku)) {
      return fail(req, 422, { errors: { sku: 'estoque.errors.skuTaken' } });
    }
    const created: InventoryItem = { ...input, id: String(Date.now()), updatedAt: new Date().toISOString() };
    items = [...items, created];
    return ok(created, 201);
  }
  return fail(req, 405);
}

function itemRoute(req: HttpRequest<unknown>, id: string): Observable<HttpEvent<unknown>> {
  const current = items.find((item) => item.id === id);
  if (!current) {
    return fail(req, 404);
  }
  switch (req.method) {
    case 'GET':
      return ok(current);
    case 'PUT': {
      const input = req.body as InventoryItemInput;
      if (skuTaken(input.sku, id)) {
        return fail(req, 422, { errors: { sku: 'estoque.errors.skuTaken' } });
      }
      const updated: InventoryItem = { ...input, id, updatedAt: new Date().toISOString() };
      items = items.map((item) => (item.id === id ? updated : item));
      return ok(updated);
    }
    case 'DELETE':
      items = items.filter((item) => item.id !== id);
      return ok(null, 204);
    default:
      return fail(req, 405);
  }
}

function skuTaken(sku: string, ignoreId?: string): boolean {
  return items.some((item) => item.id !== ignoreId && item.sku.toLowerCase() === sku.toLowerCase());
}

function ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body: structuredClone(body) }));
}

function fail(req: HttpRequest<unknown>, status: number, error: unknown = null): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, url: req.url, error }));
}
