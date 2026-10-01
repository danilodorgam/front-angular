import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { loadTranslations, provideTestEnvironment, typeInto } from '@testing/test-helpers';
import { InventoryItem } from '../../data-access/inventory.models';
import { InventoryService } from '../../data-access/inventory.service';
import { InventoryList } from './inventory-list';

const ITEMS: InventoryItem[] = [
  { id: '1', sku: 'PAP', name: 'Papel A4', description: '', quantity: 50, minimumStock: 10, unitPrice: 27.9, supplierEmail: '', updatedAt: '' },
  { id: '2', sku: 'TON', name: 'Toner', description: '', quantity: 2, minimumStock: 5, unitPrice: 189, supplierEmail: '', updatedAt: '' },
];

describe('InventoryList', () => {
  const list = vi.fn();

  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideTestEnvironment(), provideRouter([]), { provide: InventoryService, useValue: { list } }],
    });
    await loadTranslations();
    const fixture = TestBed.createComponent(InventoryList);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => list.mockReset().mockReturnValue(of(ITEMS)));

  it('renderiza a tabela com legenda, cabeçalhos e situação do estoque', async () => {
    const { root } = await setup();

    expect(root.querySelector('caption')?.textContent).toContain('Itens cadastrados (2)');
    expect(root.querySelectorAll('thead th[scope="col"]')).toHaveLength(6);
    const rows = root.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    // O Intl usa espaço não separável entre o símbolo e o valor.
    expect(rows[0].textContent?.replace(/\u00a0/g, ' ')).toContain('R$ 27,90');
    expect(rows[0].querySelector('.badge')?.textContent).toContain('Normal');
    expect(rows[1].querySelector('.badge')?.textContent).toContain('Estoque baixo');
  });

  it('links de ação têm texto único para leitores de tela', async () => {
    const { root } = await setup();

    const detailLink = root.querySelector('tbody tr a') as HTMLAnchorElement;
    expect(detailLink.textContent?.replace(/\s+/g, ' ').trim()).toBe('Detalhes de Papel A4');
    expect(detailLink.getAttribute('href')).toBe('/estoque/1');
  });

  it('pesquisa pelo termo digitado', async () => {
    const { fixture, root } = await setup();

    typeInto(root.querySelector('#busca') as HTMLInputElement, '  toner ');
    root.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(list).toHaveBeenLastCalledWith('toner');
  });

  it('mostra mensagem e botão de nova tentativa quando a carga falha', async () => {
    list.mockReturnValue(throwError(() => new Error('falhou')));
    const { root } = await setup();

    expect(root.textContent).toContain('Não foi possível carregar a lista de itens.');
    expect(root.querySelector('.alert button')?.textContent).toContain('Tentar novamente');
  });
});
