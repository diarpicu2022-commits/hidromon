import { ZonasService } from './zonas.service';

describe('ZonasService', () => {
  let service: ZonasService;

  beforeEach(() => {
    service = new ZonasService();
  });

  it('marks all initial zonas as active', () => {
    expect(service.findAll().every(zona => zona.isActive)).toBe(true);
  });

  it('creates zonas as active by default', () => {
    const zona = service.create({ nombre: 'Lote Test', cultivo: 'Papa', humedadMin: 60, humedadMax: 80 });

    expect(zona.isActive).toBe(true);
  });
});
