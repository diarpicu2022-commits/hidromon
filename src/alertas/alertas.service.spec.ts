import { AlertasService } from './alertas.service';

describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(() => {
    service = new AlertasService();
  });

  it('marks all initial alertas as active', () => {
    expect(service.findAll().every(alerta => alerta.isActive)).toBe(true);
  });

  it('creates alertas as active by default', () => {
    const alerta = service.create({ lecturaId: '1', zonaId: '1', nivel: 'Alta', mensaje: 'Prueba' });

    expect(alerta.isActive).toBe(true);
  });
});
