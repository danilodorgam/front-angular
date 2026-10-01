import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { TranslationService } from '@core/localization/translation.service';
import { TextField } from '@shared/forms';
import { InventoryItem, isLowStock } from '../../data-access/inventory.models';
import { InventoryService } from '../../data-access/inventory.service';

@Component({
  selector: 'app-inventory-list',
  imports: [RouterLink, CurrencyPipe, TranslatePipe, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory-list.html',
})
export class InventoryList {
  private readonly inventory = inject(InventoryService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly translation = inject(TranslationService);
  protected readonly isLowStock = isLowStock;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.inventory
      .list(this.search.value.trim())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => this.items.set(items),
        error: () => this.loadFailed.set(true),
      });
  }

  protected onSearch(event: Event): void {
    event.preventDefault();
    this.load();
  }

  protected clearSearch(): void {
    this.search.setValue('');
    this.load();
  }
}
