import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestEnvironment } from '@testing/test-helpers';
import { HANDLED_ERROR_STATUSES } from '@core/error-handling/http-context';
import { InventoryItemInput, isLowStock } from './inventory.models';
import { InventoryService } from './inventory.service';

const INPUT: InventoryItemInput = {
  sku: 'PAP-A4',
  name: 'Papel A4',
  description: '',
  quantity: 10,
  minimumStock: 2,
  unitPrice: 25,
  supplierEmail: '',
};

describe('InventoryService', () => {
  let service: InventoryService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTestEnvironment(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InventoryService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('usa a URL base do ambiente e envia o termo de busca', () => {
    service.list('papel').subscribe();

    const request = backend.expectOne((req) => req.url === 'http://api.test/estoque/itens');
    expect(request.request.params.get('q')).toBe('papel');
    request.flush([]);
  });

  it('não envia parâmetro de busca vazio', () => {
    service.list().subscribe();

    expect(backend.expectOne('http://api.test/estoque/itens').request.params.has('q')).toBe(false);
  });

  it('declara que a tela trata o 404 do detalhe', () => {
    service.getById('a/b').subscribe();

    const request = backend.expectOne('http://api.test/estoque/itens/a%2Fb');
    expect(request.request.context.get(HANDLED_ERROR_STATUSES)).toEqual([404]);
  });

  it('cria com POST e atualiza com PUT', () => {
    service.create(INPUT).subscribe();
    service.update('7', INPUT).subscribe();

    expect(backend.expectOne({ method: 'POST', url: 'http://api.test/estoque/itens' }).request.body).toEqual(INPUT);
    expect(backend.expectOne({ method: 'PUT', url: 'http://api.test/estoque/itens/7' }).request.body).toEqual(INPUT);
  });
});

describe('isLowStock', () => {
  it('sinaliza quando a quantidade está no mínimo ou abaixo', () => {
    expect(isLowStock({ quantity: 5, minimumStock: 5 })).toBe(true);
    expect(isLowStock({ quantity: 4, minimumStock: 5 })).toBe(true);
    expect(isLowStock({ quantity: 6, minimumStock: 5 })).toBe(false);
  });
});
