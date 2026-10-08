import { Injectable, NotFoundException } from '@nestjs/common';
import { Sensor } from './sensor.model';
import { CreateSensorDto } from './sensor.dto';

@Injectable()
export class SensoresService {

  private sensores: Sensor[] = [
    { id: '1', codigo: 'HS-001', tipo: 'Suelo', zonaId: '1', isActive: true },
    { id: '2', codigo: 'HA-002', tipo: 'Ambiental', zonaId: '1', isActive: true },
    { id: '3', codigo: 'HS-003', tipo: 'Suelo', zonaId: '2', isActive: true },
    { id: '4', codigo: 'HA-004', tipo: 'Ambiental', zonaId: '2', isActive: true },
    { id: '5', codigo: 'HS-005', tipo: 'Suelo', zonaId: '3', isActive: true },
    { id: '6', codigo: 'HA-006', tipo: 'Ambiental', zonaId: '3', isActive: true },
    { id: '7', codigo: 'HS-007', tipo: 'Suelo', zonaId: '4', isActive: true },
    { id: '8', codigo: 'HA-008', tipo: 'Ambiental', zonaId: '4', isActive: true },
    { id: '9', codigo: 'HS-009', tipo: 'Suelo', zonaId: '5', isActive: true },
    { id: '10', codigo: 'HA-010', tipo: 'Ambiental', zonaId: '5', isActive: true },
    { id: '11', codigo: 'HS-011', tipo: 'Suelo', zonaId: '6', isActive: true },
    { id: '12', codigo: 'HA-012', tipo: 'Ambiental', zonaId: '6', isActive: true },
    { id: '13', codigo: 'HS-013', tipo: 'Suelo', zonaId: '7', isActive: true },
    { id: '14', codigo: 'HA-014', tipo: 'Ambiental', zonaId: '7', isActive: true },
    { id: '15', codigo: 'HS-015', tipo: 'Suelo', zonaId: '8', isActive: true }
  ];

  findAll(): Sensor[] {
    return this.sensores.filter(sensor => sensor.isActive);
  }

  findById(id: string): Sensor | undefined {
    console.log('.:: Sensor ID:', id);
    const sensor = this.sensores.find((sensor) => sensor.id === id);
    if (sensor === undefined) {
      // Simulacion de sensor no encontrado
      throw new NotFoundException(`Sensor con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder al sensor con ID ${id}`);
    }
    return sensor;
  }

  findByTipo(tipo: string): Sensor[] {
    const sensores = this.sensores.filter(sensor => sensor.tipo === tipo);
    if (sensores.length === 0) {
      //simulacion para el tipo de sensor no existe
      throw new NotFoundException(`Sensores de tipo ${tipo} no existen`);

      // Simulacion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder a los sensores de tipo ${tipo}`);
    }
    return sensores;
  }

  create(sensorPayLoad: CreateSensorDto): Sensor {
    const newSensor: Sensor = {
      ...sensorPayLoad,
      id: `${new Date().getTime()}`,
      isActive: true
    };
    this.sensores.push(newSensor);
    return newSensor;
  }

  delete(id: string) {
    const position = this.findPosition(id);
    this.sensores.splice(position, 1);
    return { msg: `Sensor eliminado correctamente` };
  }

  update(id: string, changes: CreateSensorDto) {
    const position = this.findPosition(id);
    const updatedSensor = { ...this.sensores[position], ...changes };
    this.sensores[position] = updatedSensor;
    return updatedSensor;
  }

  private findPosition(id: string): number {
    const position = this.sensores.findIndex((sensor) => sensor.id === id);
    if (position === -1) {
      // Simulacion de sensor no encontrado
      throw new NotFoundException(`Sensor con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para modificar el sensor con ID ${id}`);
    }
    return position;
  }
}
