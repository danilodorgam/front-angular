import { ValidationErrors } from '@angular/forms';
import { TranslationService } from '../../../core/localization/translation.service';

export interface ValidationMessage {
  readonly key: string;
  readonly params: Record<string, unknown>;
}

/** Erro do validador → chave de tradução em `src/i18n/<idioma>/validation.json`. */
const MESSAGE_KEYS: Readonly<Record<string, string>> = {
  required: 'validation.required',
  notBlank: 'validation.required',
  email: 'validation.email',
  numeric: 'validation.numeric',
  minlength: 'validation.minlength',
  maxlength: 'validation.maxlength',
  min: 'validation.min',
  max: 'validation.max',
  pattern: 'validation.pattern',
  server: 'validation.server',
};

/** Quando o campo tem vários erros, mostra o mais relevante primeiro. */
const PRIORITY = Object.keys(MESSAGE_KEYS);

export function mapValidationError(errors: ValidationErrors | null | undefined): ValidationMessage | null {
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
  return { key: MESSAGE_KEYS[errorKey] ?? 'validation.invalid', params };
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
  return translation.translate(mapped.key, params);
}
