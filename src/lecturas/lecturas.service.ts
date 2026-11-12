import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lectura } from './lectura.model';
import { CreateLecturaDto, UpdateLecturaDto } from './lectura.dto';

@Injectable()
export class LecturasService {
  constructor() {}

  private lecturas: Lectura[] = [
    { id: '1', sensorId: '1', valor: 72, fecha: '2026-10-01 06:00', isActive: true },
    { id: '2', sensorId: '1', valor: 58, fecha: '2026-10-01 12:00', isActive: true },
    { id: '3', sensorId: '2', valor: 81, fecha: '2026-10-01 06:00', isActive: true },
    { id: '4', sensorId: '3', valor: 66, fecha: '2026-10-01 06:00', isActive: true },
    { id: '5', sensorId: '4', valor: 77, fecha: '2026-10-01 06:00', isActive: true },
    { id: '6', sensorId: '5', valor: 70, fecha: '2026-10-01 06:00', isActive: true },
    { id: '7', sensorId: '5', valor: 88, fecha: '2026-10-01 12:00', isActive: true },
    { id: '8', sensorId: '6', valor: 74, fecha: '2026-10-01 06:00', isActive: true },
    { id: '9', sensorId: '7', valor: 62, fecha: '2026-10-01 06:00', isActive: true },
    { id: '10', sensorId: '8', valor: 69, fecha: '2026-10-01 06:00', isActive: true },
    { id: '11', sensorId: '9', valor: 48, fecha: '2026-10-01 06:00', isActive: true },
    { id: '12', sensorId: '10', valor: 65, fecha: '2026-10-01 06:00', isActive: true },
    { id: '13', sensorId: '11', valor: 59, fecha: '2026-10-01 06:00', isActive: true },
    { id: '14', sensorId: '13', valor: 45, fecha: '2026-10-01 06:00', isActive: true },
    { id: '15', sensorId: '15', valor: 73, fecha: '2026-10-01 06:00', isActive: true },
  ];


  findAll(): Lectura[] {
    // logica de negocio
    return this.lecturas.filter((lectura) => lectura.isActive);
  }

  findById(id: string): Lectura | undefined {
    console.log('.:: Lectura ID: ', id);
    const lectura = this.lecturas.find((lectura) => lectura.id === id);
    console.log('.:: lectura buscada: ', lectura);
    if (lectura === undefined) {
      // Simulación de lectura no encontrada, error 404
      throw new NotFoundException(`Lectura con ID ${id} no existe`);
    }

    // Simulación para error de permisos
    if (lectura.id === '1') {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la lectura con ID ${id}`,
      );
    }
    return lectura;
  }

  search(sensorId: string): Lectura[] {
    const data = this.lecturas.filter((lectura) => lectura.sensorId === sensorId);
    if (data.length === 0) {
      throw new NotFoundException(`Lecturas del sensor ${sensorId} no existen`);
    }
    return data;
  }

  create(lecturaPayload: CreateLecturaDto) {
    const newLectura = {
      ...lecturaPayload,
      id: `${new Date().getTime()}`,
      isActive: true,
    };
    this.lecturas.push(newLectura);

    return {
      message: 'Lectura creada correctamente',
      data: lecturaPayload,
    };
  }

  delete(id: string) {
    const position = this.lecturas.findIndex((lectura) => lectura.id === id);
    if (position === -1) {
      throw new NotFoundException(`Lectura con ID ${id} no existe`);
    }
    this.lecturas.splice(position, 1);
    return {
      msg: 'Lectura eliminada correctamente',
    };
  }

  update(id: string, changes: UpdateLecturaDto) {
    const position = this.lecturas.findIndex((lectura) => lectura.id === id);
    if (position === -1) {
      throw new NotFoundException(`Lectura con ID ${id} no existe`);
    }
    const currentData = this.lecturas[position];
    const updateLectura = {
      ...currentData,
      ...changes,
    };
    this.lecturas[position] = updateLectura;

    return {
      msg: 'Lectura actualizada',
      data: updateLectura,
    };
  }
}
