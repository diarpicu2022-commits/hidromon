import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(() => {
    service = new UsuariosService();
  });

  it('marks all initial usuarios as active', () => {
    expect(service.findAll().every(usuario => usuario.isActive)).toBe(true);
  });

  it('creates usuarios as active by default', () => {
    const usuario = service.create({ nombre: 'Test Usuario', email: 'test@example.com', rol: 'Agricultor' });

    expect(usuario.isActive).toBe(true);
  });

  it('assigns a nickname to created usuarios', () => {
    const usuario = service.create({ nombre: 'Test Usuario', email: 'test@example.com', rol: 'Agricultor' });

    expect(usuario.nickname).toBe('Tes123');
  });
});
