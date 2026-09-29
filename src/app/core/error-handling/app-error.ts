export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'bad-request'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unavailable'
  | 'unknown';

/**
 * Erro normalizado que os componentes recebem no `error` das chamadas HTTP,
 * independentemente do formato devolvido pelo backend.
 */
export interface AppError {
  readonly kind: AppErrorKind;
  readonly status: number | null;
  /** Chave de tradução da mensagem para o usuário. */
  readonly messageKey: string;
  /** Erros por campo devolvidos pelo backend (`{ "errors": { "campo": "mensagem" } }`). */
  readonly fieldErrors?: Readonly<Record<string, string>>;
  readonly cause: unknown;
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'messageKey' in value &&
    'cause' in value
  );
}
