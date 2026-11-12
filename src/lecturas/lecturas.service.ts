import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLecturaDto, UpdateLecturaDto } from './dtos/lectura.dto';
import { Lectura } from './entities/lectura.entity';

@Injectable()
export class LecturasService {
  constructor(
    @InjectRepository(Lectura)
    private lecturaRepository: Repository<Lectura>,
  ) {}

  async findAll() {
    const lecturas = await this.lecturaRepository.find({
      relations: { sensor: true },
      order: { fecha: 'DESC' },
    });
    return {
      data: lecturas,
      count: lecturas.length,
    };
  }

  async findById(id: number) {
    const lectura = await this.findOne(id);

    // Simulación para error de permisos
    if (lectura.id === 1) {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la lectura con ID ${id}`,
      );
    }
    return lectura;
  }

  async search(sensorId: number) {
    const lecturas = await this.lecturaRepository.find({
      where: { sensor: { id: sensorId } },
      relations: { sensor: true },
      order: { fecha: 'DESC' },
    });
    if (lecturas.length === 0) {
      throw new NotFoundException(`Lecturas del sensor ${sensorId} no existen`);
    }
    return {
      data: lecturas,
      count: lecturas.length,
    };
  }

  async create(lecturaPayload: CreateLecturaDto) {
    try {
      const { sensorId, ...fields } = lecturaPayload;
      const newLectura = await this.lecturaRepository.save({
        ...fields,
        sensor: { id: sensorId },
      });
      return {
        message: 'Lectura creada correctamente',
        data: newLectura,
      };
    } catch {
      throw new BadRequestException(
        'Error al crear la lectura: revisa que el sensor exista',
      );
    }
  }

  async delete(id: number) {
    const lectura = await this.findOne(id);
    await this.lecturaRepository.delete(lectura.id);
    return {
      message: 'Lectura eliminada correctamente',
    };
  }

  async update(id: number, changes: UpdateLecturaDto) {
    const lectura = await this.findOne(id);
    const { sensorId, ...fields } = changes;
    const updatedLectura = this.lecturaRepository.merge(lectura, {
      ...fields,
      fecha: fields.fecha ? new Date(fields.fecha) : lectura.fecha,
    });
    if (sensorId !== undefined) {
      updatedLectura.sensor = { id: sensorId } as Lectura['sensor'];
    }
    try {
      const savedLectura = await this.lecturaRepository.save(updatedLectura);
      return {
        message: 'Lectura actualizada correctamente',
        data: savedLectura,
      };
    } catch {
      throw new BadRequestException(
        'Error al actualizar la lectura: revisa que el sensor exista',
      );
    }
  }

  private async findOne(id: number) {
    const lectura = await this.lecturaRepository.findOne({
      where: { id },
      relations: { sensor: true },
    });
    if (!lectura) {
      throw new NotFoundException(`Lectura con ID ${id} no existe`);
    }
    return lectura;
  }
}
