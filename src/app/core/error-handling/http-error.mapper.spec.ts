import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { isRetryable, kindFromStatus, toAppError } from './http-error.mapper';

describe('http-error.mapper', () => {
  it.each([
    [0, 'network'],
    [400, 'bad-request'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [409, 'conflict'],
    [422, 'validation'],
    [500, 'server'],
    [503, 'unavailable'],
    [504, 'timeout'],
    [418, 'unknown'],
  ] as const)('status %i → %s', (status, kind) => {
    expect(kindFromStatus(status)).toBe(kind);
  });

  it('converte HttpErrorResponse com a chave de mensagem', () => {
    const error = toAppError(new HttpErrorResponse({ status: 403 }));

    expect(error).toMatchObject({ kind: 'forbidden', status: 403, messageKey: 'errors.forbidden' });
  });

  it('extrai erros por campo do corpo da resposta', () => {
    const response = new HttpErrorResponse({
      status: 422,
      error: { errors: { sku: 'estoque.errors.skuTaken', ignored: 42 } },
    });

    expect(toAppError(response).fieldErrors).toEqual({ sku: 'estoque.errors.skuTaken' });
  });

  it('trata TimeoutError do RxJS', () => {
    expect(toAppError(new TimeoutError())).toMatchObject({ kind: 'timeout', status: null });
  });

  it('trata erros desconhecidos e é idempotente', () => {
    const unknown = toAppError(new Error('boom'));

    expect(unknown.kind).toBe('unknown');
    expect(toAppError(unknown)).toBe(unknown);
  });

  it('só considera transitórios os erros de rede e 502/503/504', () => {
    expect(isRetryable(new HttpErrorResponse({ status: 0 }))).toBe(true);
    expect(isRetryable(new HttpErrorResponse({ status: 503 }))).toBe(true);
    expect(isRetryable(new HttpErrorResponse({ status: 500 }))).toBe(false);
    expect(isRetryable(new HttpErrorResponse({ status: 404 }))).toBe(false);
  });
});
