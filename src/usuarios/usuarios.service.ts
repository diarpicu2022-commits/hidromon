import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUsuario } from './usuario.model';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dtos/usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';

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

  async delete(id: number) {
    const usuario = await this.findOne(id);
    const result = await this.usuarioRepository.delete(usuario.id);
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
