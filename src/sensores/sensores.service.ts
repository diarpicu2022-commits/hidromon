import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSensorDto, UpdateSensorDto } from './dtos/sensor.dto';
import { Sensor } from './entities/sensor.entity';
import { FichaTecnica } from './entities/ficha-tecnica.entity';

@Injectable()
export class SensoresService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
  ) {}

  async findAll() {
    const sensores = await this.sensorRepository.find({
      relations: { zona: true, fichaTecnica: true },
    });
    return {
      data: sensores,
      count: sensores.length,
    };
  }

  async findById(id: number) {
    const sensor = await this.findOne(id);

    // Simulación para error de permisos
    if (sensor.id === 1) {
      throw new ForbiddenException(
        `No tienes permisos para acceder al sensor con ID ${id}`,
      );
    }
    return sensor;
  }

  async search(tipo: string) {
    const sensores = await this.sensorRepository.find({
      where: { tipo },
      relations: { zona: true, fichaTecnica: true },
    });
    if (sensores.length === 0) {
      throw new NotFoundException(`Sensores de tipo ${tipo} no existen`);
    }
    return {
      data: sensores,
      count: sensores.length,
    };
  }

  async create(sensorPayload: CreateSensorDto) {
    try {
      // La ficha técnica llega anidada y se guarda con el sensor por cascade: true.
      const { zonaId, ...fields } = sensorPayload;
      const newSensor = await this.sensorRepository.save({
        ...fields,
        zona: { id: zonaId },
      });
      return {
        message: 'Sensor creado correctamente',
        data: newSensor,
      };
    } catch {
      throw new BadRequestException(
        'Error al crear el sensor: revisa que la zona exista y que el código no esté repetido',
      );
    }
  }

  async delete(id: number) {
    const sensor = await this.findOne(id);
    try {
      // Sensor y ficha en una transacción: si el sensor tiene lecturas no se borra nada.
      await this.sensorRepository.manager.transaction(async (manager) => {
        await manager.delete(Sensor, sensor.id);
        if (sensor.fichaTecnica) await manager.delete(FichaTecnica, sensor.fichaTecnica.id);
      });
    } catch {
      throw new ConflictException(
        'El sensor tiene lecturas asociadas, no se puede eliminar',
      );
    }
    return {
      message: 'Sensor eliminado correctamente',
    };
  }

  async update(id: number, changes: UpdateSensorDto) {
    const sensor = await this.findOne(id);
    const { zonaId, fichaTecnica, ...fields } = changes;
    const updatedSensor = this.sensorRepository.merge(sensor, fields);
    if (zonaId !== undefined) {
      updatedSensor.zona = { id: zonaId } as Sensor['zona'];
    }
    // La ficha se corrige por partes. Un sensor viejo sin ficha la recibe completa.
    if (fichaTecnica) {
      updatedSensor.fichaTecnica = Object.assign(sensor.fichaTecnica ?? {}, fichaTecnica) as FichaTecnica;
    }
    try {
      const savedSensor = await this.sensorRepository.save(updatedSensor);
      return {
        message: 'Sensor actualizado correctamente',
        data: savedSensor,
      };
    } catch {
      throw new BadRequestException(
        'Error al actualizar el sensor: revisa que la zona exista y que el código no esté repetido',
      );
    }
  }

  private async findOne(id: number) {
    const sensor = await this.sensorRepository.findOne({
      where: { id },
      relations: { zona: true, fichaTecnica: true },
    });
    if (!sensor) {
      throw new NotFoundException(`Sensor con ID ${id} no existe`);
    }
    return sensor;
  }
}
