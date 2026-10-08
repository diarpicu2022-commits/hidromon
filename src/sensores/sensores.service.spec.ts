import { SensoresService } from './sensores.service';

describe('SensoresService', () => {
  let service: SensoresService;

  beforeEach(() => {
    service = new SensoresService();
  });

  it('marks all initial sensores as active', () => {
    expect(service.findAll().every(sensor => sensor.isActive)).toBe(true);
  });

  it('creates sensores as active by default', () => {
    const sensor = service.create({ codigo: 'HS-999', tipo: 'Suelo', zonaId: '1' });

    expect(sensor.isActive).toBe(true);
  });
});
