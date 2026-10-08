import { LecturasService } from './lecturas.service';

describe('LecturasService', () => {
  let service: LecturasService;

  beforeEach(() => {
    service = new LecturasService();
  });

  it('marks all initial lecturas as active', () => {
    expect(service.findAll().every(lectura => lectura.isActive)).toBe(true);
  });

  it('creates lecturas as active by default', () => {
    const lectura = service.create({ sensorId: '1', valor: 70, fecha: '2026-10-01 18:00' });

    expect(lectura.isActive).toBe(true);
  });
});
