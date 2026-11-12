import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertaDto, UpdateAlertaDto } from './dtos/alerta.dto';
import { Alerta } from './entities/alerta.entity';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private alertaRepository: Repository<Alerta>,
  ) {}

  async findAll(resuelta?: boolean) {
    const alertas = await this.alertaRepository.find({
      where: resuelta === undefined ? {} : { resuelta },
      relations: { lectura: true, zona: true },
      order: { createdAt: 'DESC' },
    });
    return {
      data: alertas,
      count: alertas.length,
    };
  }

  async findById(id: number) {
    const alerta = await this.findOne(id);

    // Simulación para error de permisos
    if (alerta.id === 1) {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la alerta con ID ${id}`,
      );
    }
    return alerta;
  }

  async search(nivel: string) {
    const alertas = await this.alertaRepository.find({
      where: { nivel },
      relations: { lectura: true, zona: true },
      order: { createdAt: 'DESC' },
    });
    if (alertas.length === 0) {
      throw new NotFoundException(`Alertas de nivel ${nivel} no existen`);
    }
    return {
      data: alertas,
      count: alertas.length,
    };
  }

  async create(alertaPayload: CreateAlertaDto) {
    try {
      const { lecturaId, zonaId, ...fields } = alertaPayload;
      const newAlerta = await this.alertaRepository.save({
        ...fields,
        lectura: { id: lecturaId },
        zona: { id: zonaId },
      });
      return {
        message: 'Alerta creada correctamente',
        data: newAlerta,
      };
    } catch {
      throw new BadRequestException(
        'Error al crear la alerta: revisa que la lectura y la zona existan',
      );
    }
  }

  async delete(id: number) {
    const alerta = await this.findOne(id);
    await this.alertaRepository.delete(alerta.id);
    return {
      message: 'Alerta eliminada correctamente',
    };
  }

  async update(id: number, changes: UpdateAlertaDto) {
    const alerta = await this.findOne(id);
    const { lecturaId, zonaId, ...fields } = changes;
    const updatedAlerta = this.alertaRepository.merge(alerta, fields);
    if (lecturaId !== undefined) {
      updatedAlerta.lectura = { id: lecturaId } as Alerta['lectura'];
    }
    if (zonaId !== undefined) {
      updatedAlerta.zona = { id: zonaId } as Alerta['zona'];
    }
    try {
      const savedAlerta = await this.alertaRepository.save(updatedAlerta);
      return {
        message: 'Alerta actualizada correctamente',
        data: savedAlerta,
      };
    } catch {
      throw new BadRequestException(
        'Error al actualizar la alerta: revisa que la lectura y la zona existan',
      );
    }
  }

  async resolve(id: number) {
    const alerta = await this.findOne(id);
    if (alerta.resuelta) {
      return {
        message: 'La alerta ya estaba resuelta',
        data: alerta,
      };
    }
    alerta.resuelta = true;
    alerta.resueltaAt = new Date();
    const savedAlerta = await this.alertaRepository.save(alerta);
    return {
      message: 'Alerta resuelta correctamente',
      data: savedAlerta,
    };
  }

  private async findOne(id: number) {
    const alerta = await this.alertaRepository.findOne({
      where: { id },
      relations: { lectura: true, zona: true },
    });
    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no existe`);
    }
    return alerta;
  }
}
