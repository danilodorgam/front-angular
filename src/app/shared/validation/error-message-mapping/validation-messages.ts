import { ValidationErrors } from '@angular/forms';
import { TranslationService } from '@core/localization/translation.service';

export interface ValidationMessage {
  readonly key: string;
  readonly params: Record<string, unknown>;
  /** Usada quando `key` não existe no catálogo de traduções. */
  readonly fallbackKey?: string;
}

/** Chave fixa ou escolhida a partir dos parâmetros do erro. */
type MessageKey = string | ((params: Record<string, unknown>) => string);

/**
 * Erros cuja chave foge da convenção `validation.<nomeDoErro>`
 * (ou que precisam de prioridade sobre os demais).
 */
const MESSAGE_KEYS: Readonly<Record<string, MessageKey>> = {
  required: 'validation.required',
  notBlank: 'validation.required',
  email: 'validation.email',
  numeric: (params) =>
    params['allowDecimal'] ? 'validation.numeric.decimal' : 'validation.numeric.integer',
  decimalPlaces: 'validation.decimalPlaces',
  minlength: 'validation.minlength',
  maxlength: 'validation.maxlength',
  min: 'validation.min',
  max: 'validation.max',
  pattern: 'validation.pattern',
  server: 'validation.server',
};

const GENERIC_KEY = 'validation.invalid';

/** Quando o campo tem vários erros, mostra o mais relevante primeiro. */
const PRIORITY = Object.keys(MESSAGE_KEYS);

/**
 * Escolhe a chave de tradução do erro, nesta ordem:
 * 1. `messageKey` enviado pelo próprio validador (ex.: `AppValidators.pattern(regex, 'x.y')`);
 * 2. o mapa `MESSAGE_KEYS`;
 * 3. a convenção `validation.<nomeDoErro>`, com `validation.invalid` como reserva.
 *    Assim um validador novo (ex.: `cpf`) só precisa da mensagem no `validation.json`.
 */
export function mapValidationError(
  errors: ValidationErrors | null | undefined,
): ValidationMessage | null {
  if (!errors) {
    return null;
  }
  const errorKey = PRIORITY.find((key) => key in errors) ?? Object.keys(errors)[0];
  if (!errorKey) {
    return null;
  }
  const value: unknown = errors[errorKey];
  const params: Record<string, unknown> =
    errorKey === 'server'
      ? { message: value }
      : typeof value === 'object' && value !== null
        ? { ...value }
        : {};

  if (typeof params['messageKey'] === 'string') {
    return { key: params['messageKey'], params, fallbackKey: GENERIC_KEY };
  }
  const mapped = MESSAGE_KEYS[errorKey];
  if (mapped) {
    return { key: typeof mapped === 'function' ? mapped(params) : mapped, params };
  }
  return { key: `validation.${errorKey}`, params, fallbackKey: GENERIC_KEY };
}

/**
 * Monta a mensagem final já traduzida, incluindo o nome do campo.
 * Mensagens do servidor podem ser textos prontos ou chaves de tradução.
 */
export function translateValidationError(
  translation: TranslationService,
  errors: ValidationErrors | null | undefined,
  fieldLabelKey: string,
): string | null {
  const mapped = mapValidationError(errors);
  if (!mapped) {
    return null;
  }
  const params: Record<string, unknown> = {
    ...mapped.params,
    field: translation.translate(fieldLabelKey),
  };
  if (typeof params['message'] === 'string') {
    params['message'] = translation.translate(params['message']);
  }
  const message = translation.translate(mapped.key, params);
  // O TranslationService devolve a própria chave quando ela não existe no catálogo.
  return message === mapped.key && mapped.fallbackKey
    ? translation.translate(mapped.fallbackKey, params)
    : message;
}
