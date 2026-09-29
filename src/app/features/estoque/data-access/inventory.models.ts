export interface InventoryItem {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string;
  readonly quantity: number;
  readonly minimumStock: number;
  readonly unitPrice: number;
  readonly supplierEmail: string;
  readonly updatedAt: string;
}

export type InventoryItemInput = Omit<InventoryItem, 'id' | 'updatedAt'>;

export function isLowStock(item: Pick<InventoryItem, 'quantity' | 'minimumStock'>): boolean {
  return item.quantity <= item.minimumStock;
}
