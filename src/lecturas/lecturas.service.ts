import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLecturaDto, UpdateLecturaDto } from './dtos/lectura.dto';
import { Lectura } from './entities/lectura.entity';
import { Sensor } from '../sensores/entities/sensor.entity';
import { Alerta } from '../alertas/entities/alerta.entity';

@Injectable()
export class LecturasService {
  constructor(
    @InjectRepository(Lectura)
    private lecturaRepository: Repository<Lectura>,
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    @InjectRepository(Alerta)
    private alertaRepository: Repository<Alerta>,
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
    const { sensorId, ...fields } = lecturaPayload;
    const sensor = await this.sensorRepository.findOne({
      where: { id: sensorId },
      relations: { zona: true },
    });
    if (!sensor) {
      throw new BadRequestException(
        'Error al crear la lectura: revisa que el sensor exista',
      );
    }

    let newLectura: Lectura;
    try {
      newLectura = await this.lecturaRepository.save({
        ...fields,
        sensor: { id: sensorId },
      });
    } catch {
      throw new BadRequestException(
        'Error al crear la lectura: revisa que el sensor exista',
      );
    }

    const { alerta, resueltas } = await this.evaluarAlertas(newLectura, sensor);
    return {
      message: 'Lectura creada correctamente',
      data: newLectura,
      alerta,
      alertasResueltas: resueltas,
    };
  }

  // Si la lectura sale del rango de la zona se abre una alerta (Alta o Baja);
  // si vuelve al rango, se resuelven las alertas abiertas de ese sensor.
  private async evaluarAlertas(lectura: Lectura, sensor: Sensor) {
    const { zona } = sensor;
    const nivel =
      lectura.valor > zona.humedadMax
        ? 'Alta'
        : lectura.valor < zona.humedadMin
          ? 'Baja'
          : null;

    const abiertas = await this.alertaRepository.find({
      where: { resuelta: false, lectura: { sensor: { id: sensor.id } } },
    });
    const aResolver = abiertas.filter((a) => a.nivel !== nivel);
    if (aResolver.length > 0) {
      const ahora = new Date();
      await this.alertaRepository.save(
        aResolver.map((a) => ({ ...a, resuelta: true, resueltaAt: ahora })),
      );
    }

    // En rango, o ya hay una alerta abierta del mismo nivel: no se duplica.
    if (nivel === null || abiertas.some((a) => a.nivel === nivel)) {
      return { alerta: null, resueltas: aResolver.length };
    }

    const motivo =
      nivel === 'Alta'
        ? `por encima del máximo de ${zona.humedadMax}%`
        : `por debajo del mínimo de ${zona.humedadMin}%`;
    const alerta = await this.alertaRepository.save({
      nivel,
      mensaje: `Sensor ${sensor.codigo}: humedad ${lectura.valor}% ${motivo}`,
      lectura: { id: lectura.id },
      zona: { id: zona.id },
    });
    return { alerta, resueltas: aResolver.length };
  }

  async delete(id: number) {
    const lectura = await this.findOne(id);
    try {
      await this.lecturaRepository.delete(lectura.id);
    } catch {
      throw new ConflictException(
        'La lectura tiene alertas asociadas, no se puede eliminar',
      );
    }
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
