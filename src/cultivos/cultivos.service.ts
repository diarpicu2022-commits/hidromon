import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCultivoDto, UpdateCultivoDto } from './dtos/cultivo.dto';
import { Cultivo } from './entities/cultivo.entity';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo)
    private cultivoRepository: Repository<Cultivo>,
  ) {}

  async findAll() {
    const cultivos = await this.cultivoRepository.find({ order: { nombre: 'ASC' } });
    return {
      data: cultivos,
      count: cultivos.length,
    };
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  async create(cultivoPayload: CreateCultivoDto) {
    try {
      const newCultivo = await this.cultivoRepository.save(cultivoPayload);
      return {
        message: 'Cultivo creado correctamente',
        data: newCultivo,
      };
    } catch {
      throw new ConflictException(
        `Ya existe un cultivo llamado ${cultivoPayload.nombre}`,
      );
    }
  }

  async update(id: number, changes: UpdateCultivoDto) {
    const cultivo = await this.findOne(id);
    const updatedCultivo = this.cultivoRepository.merge(cultivo, changes);
    try {
      const savedCultivo = await this.cultivoRepository.save(updatedCultivo);
      return {
        message: 'Cultivo actualizado correctamente',
        data: savedCultivo,
      };
    } catch {
      throw new ConflictException(
        `Ya existe un cultivo llamado ${changes.nombre}`,
      );
    }
  }

  // Al borrar un cultivo, TypeORM borra sus filas en zonas_cultivos:
  // las zonas siguen existiendo, solo pierden ese cultivo.
  async delete(id: number) {
    const cultivo = await this.findOne(id);
    await this.cultivoRepository.delete(cultivo.id);
    return {
      message: 'Cultivo eliminado correctamente',
    };
  }

  private async findOne(id: number) {
    const cultivo = await this.cultivoRepository.findOne({
      where: { id },
      relations: { zonas: true },
    });
    if (!cultivo) {
      throw new NotFoundException(`Cultivo con ID ${id} no existe`);
    }
    return cultivo;
  }
}
