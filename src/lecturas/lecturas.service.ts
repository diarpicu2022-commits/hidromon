import { Injectable, NotFoundException } from '@nestjs/common';
import { Lectura } from './lectura.model';
import { CreateLecturaDto } from './lectura.dto';

@Injectable()
export class LecturasService {

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
    { id: '15', sensorId: '15', valor: 73, fecha: '2026-10-01 06:00', isActive: true }
  ];

  findAll(): Lectura[] {
    return this.lecturas.filter(lectura => lectura.isActive);
  }

  findById(id: string): Lectura | undefined {
    console.log('.:: Lectura ID:', id);
    const lectura = this.lecturas.find((lectura) => lectura.id === id);
    if (lectura === undefined) {
      // Simulacion de lectura no encontrada
      throw new NotFoundException(`Lectura con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder a la lectura con ID ${id}`);
    }
    return lectura;
  }

  findBySensor(sensorId: string): Lectura[] {
    const lecturas = this.lecturas.filter(lectura => lectura.sensorId === sensorId);
    if (lecturas.length === 0) {
      //simulacion para el sensor sin lecturas
      throw new NotFoundException(`Lecturas del sensor ${sensorId} no existen`);

      // Simulacion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder a las lecturas del sensor ${sensorId}`);
    }
    return lecturas;
  }

  create(lecturaPayLoad: CreateLecturaDto): Lectura {
    const newLectura: Lectura = {
      ...lecturaPayLoad,
      id: `${new Date().getTime()}`,
      isActive: true
    };
    this.lecturas.push(newLectura);
    return newLectura;
  }

  delete(id: string) {
    const position = this.findPosition(id);
    this.lecturas.splice(position, 1);
    return { msg: `Lectura eliminada correctamente` };
  }

  update(id: string, changes: CreateLecturaDto) {
    const position = this.findPosition(id);
    const updatedLectura = { ...this.lecturas[position], ...changes };
    this.lecturas[position] = updatedLectura;
    return updatedLectura;
  }

  private findPosition(id: string): number {
    const position = this.lecturas.findIndex((lectura) => lectura.id === id);
    if (position === -1) {
      // Simulacion de lectura no encontrada
      throw new NotFoundException(`Lectura con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para modificar la lectura con ID ${id}`);
    }
    return position;
  }
}
