import type { AuthUser } from '@features/auth/data-access/auth.models';
import type { InventoryItem } from '@features/estoque/data-access/inventory.models';

/** Credenciais aceitas pelo backend simulado (somente para desenvolvimento local). */
export const MOCK_CREDENTIALS = { email: 'admin@exemplo.gov.br', password: 'Senha@123' } as const;
export const MOCK_TOKEN = 'token-de-demonstracao';

export const MOCK_USER: AuthUser = {
  id: '1',
  name: 'Maria Silva',
  email: MOCK_CREDENTIALS.email,
  roles: ['estoque:editar'],
};

export const MOCK_ITEMS: readonly InventoryItem[] = [
  {
    id: '1',
    sku: 'PAP-A4-500',
    name: 'Papel A4 (resma com 500 folhas)',
    description: 'Papel sulfite branco 75 g/m².',
    quantity: 120,
    minimumStock: 40,
    unitPrice: 27.9,
    supplierEmail: 'vendas@papelaria.exemplo.com',
    updatedAt: '2026-09-20T13:45:00Z',
  },
  {
    id: '2',
    sku: 'CAN-AZ-50',
    name: 'Caneta esferográfica azul (caixa com 50)',
    description: '',
    quantity: 8,
    minimumStock: 10,
    unitPrice: 42.5,
    supplierEmail: 'vendas@papelaria.exemplo.com',
    updatedAt: '2026-09-18T09:10:00Z',
  },
  {
    id: '3',
    sku: 'TON-HP-85A',
    name: 'Toner para impressora HP 85A',
    description: 'Compatível com LaserJet P1102 e M1132.',
    quantity: 3,
    minimumStock: 5,
    unitPrice: 189.0,
    supplierEmail: 'suprimentos@informatica.exemplo.com',
    updatedAt: '2026-09-25T17:30:00Z',
  },
  {
    id: '4',
    sku: 'GRA-26-6',
    name: 'Grampo 26/6 (caixa com 5000)',
    description: '',
    quantity: 60,
    minimumStock: 15,
    unitPrice: 6.75,
    supplierEmail: '',
    updatedAt: '2026-09-10T11:00:00Z',
  },
];
