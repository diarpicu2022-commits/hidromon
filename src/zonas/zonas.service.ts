import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateZonaDto, UpdateZonaDto } from './dtos/zona.dto';
import { Zona } from './entities/zona.entity';
import { Cultivo } from '../cultivos/entities/cultivo.entity';

@Injectable()
export class ZonasService {
  constructor(
    @InjectRepository(Zona)
    private zonaRepository: Repository<Zona>,
    @InjectRepository(Cultivo)
    private cultivoRepository: Repository<Cultivo>,
  ) {}

  async findAll() {
    const zonas = await this.zonaRepository.find({
      relations: { usuario: true, cultivos: true },
    });
    return {
      data: zonas,
      count: zonas.length,
    };
  }

  async findById(id: number) {
    const zona = await this.findOne(id);

    // Simulación para error de permisos
    if (zona.id === 1) {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la zona con ID ${id}`,
      );
    }
    return zona;
  }

  async search(cultivo: string) {
    const zonas = await this.zonaRepository.find({
      where: { cultivo },
      relations: { usuario: true, cultivos: true },
    });
    if (zonas.length === 0) {
      throw new NotFoundException(`Zonas con cultivo ${cultivo} no existen`);
    }
    return {
      data: zonas,
      count: zonas.length,
    };
  }

  async create(zonaPayload: CreateZonaDto) {
    const { usuarioId, cultivoIds, ...fields } = zonaPayload;
    const cultivos = await this.findCultivos(cultivoIds ?? []);
    try {
      const newZona = await this.zonaRepository.save({
        ...fields,
        usuario: usuarioId ? { id: usuarioId } : null,
        cultivos,
      });
      return {
        message: 'Zona creada correctamente',
        data: newZona,
      };
    } catch {
      throw new BadRequestException(
        'Error al crear la zona: revisa que el usuario responsable exista',
      );
    }
  }

  async delete(id: number) {
    const zona = await this.findOne(id);
    try {
      await this.zonaRepository.delete(zona.id);
    } catch {
      throw new ConflictException(
        'La zona tiene sensores o alertas asociados, no se puede eliminar',
      );
    }
    return {
      message: 'Zona eliminada correctamente',
    };
  }

  async update(id: number, changes: UpdateZonaDto) {
    const zona = await this.findOne(id);
    const { usuarioId, cultivoIds, ...fields } = changes;
    const updatedZona = this.zonaRepository.merge(zona, fields);
    if (usuarioId !== undefined) {
      updatedZona.usuario = usuarioId === null ? null : ({ id: usuarioId } as Zona['usuario']);
    }
    // Si llegan cultivoIds, reemplazan la lista completa de cultivos de la zona.
    if (cultivoIds !== undefined) {
      updatedZona.cultivos = await this.findCultivos(cultivoIds);
    }
    try {
      const savedZona = await this.zonaRepository.save(updatedZona);
      return {
        message: 'Zona actualizada correctamente',
        data: savedZona,
      };
    } catch {
      throw new BadRequestException(
        'Error al actualizar la zona: revisa que el usuario responsable exista',
      );
    }
  }

  private async findOne(id: number) {
    const zona = await this.zonaRepository.findOne({
      where: { id },
      relations: { usuario: true, cultivos: true },
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no existe`);
    }
    return zona;
  }

  private async findCultivos(ids: number[]) {
    if (ids.length === 0) {
      return [];
    }
    const cultivos = await this.cultivoRepository.findBy({ id: In(ids) });
    if (cultivos.length !== ids.length) {
      const encontrados = cultivos.map((cultivo) => cultivo.id);
      const faltan = ids.filter((id) => !encontrados.includes(id));
      throw new BadRequestException(`Cultivos con ID ${faltan.join(', ')} no existen`);
    }
    return cultivos;
  }
}
