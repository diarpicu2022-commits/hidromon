import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Usuario } from './usuario.model';
import { CreateUsuarioDto, UpdateUsuarioDto } from './usuario.dto';

@Injectable()
export class UsuariosService {
  constructor() {}

  private usuarios: Usuario[] = [
    { id: '1', nombre: 'Diego Pinta', email: 'diego.pinta@hidromon.com', rol: 'Administrador', isActive: true },
    { id: '2', nombre: 'Leider Chipu', email: 'leider.chipu@hidromon.com', rol: 'Administrador', isActive: true },
    { id: '3', nombre: 'Juan Rueda', email: 'juan.rueda@hidromon.com', rol: 'Administrador', isActive: true },
    { id: '4', nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@example.com', rol: 'Agricultor', isActive: true },
    { id: '5', nombre: 'María González', email: 'maria.gonzalez@example.com', rol: 'Agricultor', isActive: true },
    { id: '6', nombre: 'Luis Martínez', email: 'luis.martinez@example.com', rol: 'Agricultor', isActive: true },
    { id: '7', nombre: 'Ana López', email: 'ana.lopez@example.com', rol: 'Agricultor', isActive: true },
    { id: '8', nombre: 'Laura Torres', email: 'laura.torres@example.com', rol: 'Agricultor', isActive: true },
    { id: '9', nombre: 'Andrés Ramírez', email: 'andres.ramirez@example.com', rol: 'Agricultor', isActive: true },
    { id: '10', nombre: 'Sofía Hernández', email: 'sofia.hernandez@example.com', rol: 'Agricultor', isActive: true },
    { id: '11', nombre: 'Miguel Castro', email: 'miguel.castro@example.com', rol: 'Agricultor', isActive: true },
    { id: '12', nombre: 'Valentina Moreno', email: 'valentina.moreno@example.com', rol: 'Agricultor', isActive: true },
    { id: '13', nombre: 'Juan García', email: 'juan.garcia@example.com', rol: 'Agricultor', isActive: true },
    { id: '14', nombre: 'Camila Vargas', email: 'camila.vargas@example.com', rol: 'Agricultor', isActive: true },
    { id: '15', nombre: 'Sebastián Ruiz', email: 'sebastian.ruiz@example.com', rol: 'Agricultor', isActive: true },
  ];


  findAll(): Usuario[] {
    // logica de negocio
    return this.usuarios.filter((usuario) => usuario.isActive);
  }

  findById(id: string): Usuario | undefined {
    console.log('.:: Usuario ID: ', id);
    const usuario = this.usuarios.find((usuario) => usuario.id === id);
    console.log('.:: usuario buscado: ', usuario);
    if (usuario === undefined) {
      // Simulación de usuario no encontrado, error 404
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }

    // Simulación para error de permisos
    if (usuario.id === '1') {
      throw new ForbiddenException(
        `No tienes permisos para acceder al usuario con ID ${id}`,
      );
    }
    return usuario;
  }

  search(nombre: string): any | undefined {
    const data = this.usuarios.find((usuario) => usuario.nombre === nombre);
    if (!data) {
      throw new NotFoundException(`Usuario con nombre ${nombre} no existe`);
    }
    return { result: data.email };
  }

  create(usuarioPayload: CreateUsuarioDto) {
    const newUsuario = {
      ...usuarioPayload,
      id: `${new Date().getTime()}`,
      nickname: this.nicknameGenerator(usuarioPayload.nombre),
      isActive: true,
    };
    this.usuarios.push(newUsuario);

    return {
      message: 'Usuario creado correctamente',
      data: usuarioPayload,
    };
  }

  delete(id: string) {
    const position = this.usuarios.findIndex((usuario) => usuario.id === id);
    if (position === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    this.usuarios.splice(position, 1);
    return {
      msg: 'Usuario eliminado correctamente',
    };
  }

  update(id: string, changes: UpdateUsuarioDto) {
    const position = this.usuarios.findIndex((usuario) => usuario.id === id);
    if (position === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    const currentData = this.usuarios[position];
    const updateUsuario = {
      ...currentData,
      ...changes,
    };
    this.usuarios[position] = updateUsuario;

    return {
      msg: 'Usuario actualizado',
      data: updateUsuario,
    };
  }

  nicknameGenerator(nombre: string): string {
    return nombre.substring(0, 3) + '123';
  }
}
