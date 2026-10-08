import { Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from './usuario.model';
import { CreateUsuarioDto } from './usuario.dto';

@Injectable()
export class UsuariosService {

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
    { id: '15', nombre: 'Sebastián Ruiz', email: 'sebastian.ruiz@example.com', rol: 'Agricultor', isActive: true }
  ];

  findAll(): Usuario[] {
    return this.usuarios.filter(usuario => usuario.isActive);
  }

  findById(id: string): Usuario | undefined {
    console.log('.:: Usuario ID:', id);
    const usuario = this.usuarios.find((usuario) => usuario.id === id);
    if (usuario === undefined) {
      // Simulacion de usuario no encontrado
      throw new NotFoundException(`Usuario con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder al usuario con ID ${id}`);
    }
    return usuario;
  }

  findByNombre(nombre: string): string | undefined | any {
    const usuario = this.usuarios.find(usuario => usuario.nombre === nombre);
    if (usuario === undefined) {
      //simulacion para el nombre no existe
      throw new NotFoundException(`Usuario con nombre ${nombre} no existe`);

      // Simulacion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder al usuario con nombre ${nombre}`);
    }
    return {result: usuario.email};
  }

  create(usuarioPayLoad: CreateUsuarioDto): Usuario {
    const newUsuario: Usuario = {
      ...usuarioPayLoad,
      id: `${new Date().getTime()}`,
      nickname: usuarioPayLoad.nombre.substring(0, 3) + '123',
      isActive: true
    };
    this.usuarios.push(newUsuario);
    return newUsuario;
  }

  delete(id: string) {
    const position = this.findPosition(id);
    this.usuarios.splice(position, 1);
    return { msg: `Usuario eliminado correctamente` };
  }

  update(id: string, changes: CreateUsuarioDto) {
    const position = this.findPosition(id);
    const updatedUsuario = { ...this.usuarios[position], ...changes };
    this.usuarios[position] = updatedUsuario;
    return updatedUsuario;
  }

  private findPosition(id: string): number {
    const position = this.usuarios.findIndex((usuario) => usuario.id === id);
    if (position === -1) {
      // Simulacion de usuario no encontrado
      throw new NotFoundException(`Usuario con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para modificar al usuario con ID ${id}`);
    }
    return position;
  }
}
