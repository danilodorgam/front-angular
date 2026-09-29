import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENVIRONMENT } from '../../../../environments/environment.token';
import { handledErrors } from '../../../core/error-handling/http-context';
import { InventoryItem, InventoryItemInput } from './inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(APP_ENVIRONMENT).api.baseUrl}/estoque/itens`;

  list(search = ''): Observable<InventoryItem[]> {
    const params = search ? new HttpParams().set('q', search) : undefined;
    return this.http.get<InventoryItem[]>(this.baseUrl, { params });
  }

  /** 404 é tratado pela tela (mensagem "item não encontrado"). */
  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(this.itemUrl(id), { context: handledErrors(404) });
  }

  /** 400/422 são tratados pelo formulário (erros exibidos em cada campo). */
  create(input: InventoryItemInput): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.baseUrl, input, { context: handledErrors(400, 422) });
  }

  update(id: string, input: InventoryItemInput): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(this.itemUrl(id), input, { context: handledErrors(400, 422) });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(this.itemUrl(id));
  }

  private itemUrl(id: string): string {
    return `${this.baseUrl}/${encodeURIComponent(id)}`;
  }
}
