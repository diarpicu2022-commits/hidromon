import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUsuario } from './usuario.model';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dtos/usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Perfil } from './entities/perfil.entity';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<IUsuario>,
  ) {}

  async findAll() {
    // logica de negocio
    const usuarios = await this.usuarioRepository.find();
    return {
      data: usuarios,
      count: usuarios.length,
    };
  }

  async findById(id: number) {
    const usuario = await this.findOne(id);

    // Simulación para error de permisos
    if (usuario.id === 1) {
      throw new ForbiddenException(
        `No tienes permisos para acceder al usuario con ID ${id}`,
      );
    }
    return usuario;
  }

  async search(nombre: string) {
    const usuario = await this.usuarioRepository.findOneBy({ nombre });
    if (!usuario) {
      throw new NotFoundException(`Usuario con nombre ${nombre} no existe`);
    }
    return { result: usuario.email };
  }

  async create(usuarioPayload: CreateUsuarioDto) {
    try {
      const newUsuario = await this.usuarioRepository.save(usuarioPayload);
      return newUsuario;
    } catch {
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  // Borra el usuario y su perfil en una sola transacción, para no dejar municipio y finca
  // guardados sin dueño. Si el usuario es responsable de zonas no se borra nada.
  async delete(id: number) {
    // El repositorio está tipado con IUsuario, que no trae el perfil: se consulta la entidad.
    const usuario = await this.usuarioRepository.manager.findOne(Usuario, {
      where: { id },
      relations: { perfil: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    let result;
    try {
      result = await this.usuarioRepository.manager.transaction(async (manager) => {
        const borrado = await manager.delete(Usuario, usuario.id);
        if (usuario.perfil) await manager.delete(Perfil, usuario.perfil.id);
        return borrado;
      });
    } catch {
      throw new ConflictException(
        'El usuario es responsable de zonas, no se puede eliminar',
      );
    }
    return {
      message: 'Usuario eliminado correctamente',
      data: result,
    };
  }

  async update(id: number, changes: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    const updatedUsuario = this.usuarioRepository.merge(usuario, changes);
    return this.usuarioRepository.save(updatedUsuario);
  }

  private async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    return usuario;
  }
}
