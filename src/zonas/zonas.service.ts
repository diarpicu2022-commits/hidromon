import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateZonaDto, UpdateZonaDto } from './dtos/zona.dto';
import { Zona } from './entities/zona.entity';

@Injectable()
export class ZonasService {
  constructor(
    @InjectRepository(Zona)
    private zonaRepository: Repository<Zona>,
  ) {}

  async findAll() {
    const zonas = await this.zonaRepository.find();
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
    const zonas = await this.zonaRepository.findBy({ cultivo });
    if (zonas.length === 0) {
      throw new NotFoundException(`Zonas con cultivo ${cultivo} no existen`);
    }
    return {
      data: zonas,
      count: zonas.length,
    };
  }

  async create(zonaPayload: CreateZonaDto) {
    try {
      const newZona = await this.zonaRepository.save(zonaPayload);
      return {
        message: 'Zona creada correctamente',
        data: newZona,
      };
    } catch {
      throw new BadRequestException('Error al crear la zona');
    }
  }

  async delete(id: number) {
    const zona = await this.findOne(id);
    await this.zonaRepository.delete(zona.id);
    return {
      message: 'Zona eliminada correctamente',
    };
  }

  async update(id: number, changes: UpdateZonaDto) {
    const zona = await this.findOne(id);
    const updatedZona = this.zonaRepository.merge(zona, changes);
    const savedZona = await this.zonaRepository.save(updatedZona);
    return {
      message: 'Zona actualizada correctamente',
      data: savedZona,
    };
  }

  private async findOne(id: number) {
    const zona = await this.zonaRepository.findOneBy({ id });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no existe`);
    }
    return zona;
  }
}
