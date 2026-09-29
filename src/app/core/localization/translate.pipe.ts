import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslationParams } from './translation.types';

/**
 * Uso: `{{ 'estoque.list.title' | translate }}` ou `{{ 'common.user.loggedAs' | translate: { name } }}`.
 * É impuro para refletir a troca de idioma; o custo é só uma busca em objeto.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(key: string, params?: TranslationParams): string {
    return this.translation.translate(key, params);
  }
}
