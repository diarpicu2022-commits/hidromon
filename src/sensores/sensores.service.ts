import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sensor } from './sensor.model';
import { CreateSensorDto, UpdateSensorDto } from './sensor.dto';

@Injectable()
export class SensoresService {
  constructor() {}

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
    { id: '15', codigo: 'HS-015', tipo: 'Suelo', zonaId: '8', isActive: true },
  ];


  findAll(): Sensor[] {
    // logica de negocio
    return this.sensores.filter((sensor) => sensor.isActive);
  }

  findById(id: string): Sensor | undefined {
    console.log('.:: Sensor ID: ', id);
    const sensor = this.sensores.find((sensor) => sensor.id === id);
    console.log('.:: sensor buscado: ', sensor);
    if (sensor === undefined) {
      // Simulación de sensor no encontrado, error 404
      throw new NotFoundException(`Sensor con ID ${id} no existe`);
    }

    // Simulación para error de permisos
    if (sensor.id === '1') {
      throw new ForbiddenException(
        `No tienes permisos para acceder al sensor con ID ${id}`,
      );
    }
    return sensor;
  }

  search(tipo: string): Sensor[] {
    const data = this.sensores.filter((sensor) => sensor.tipo === tipo);
    if (data.length === 0) {
      throw new NotFoundException(`Sensores de tipo ${tipo} no existen`);
    }
    return data;
  }

  create(sensorPayload: CreateSensorDto) {
    const newSensor = {
      ...sensorPayload,
      id: `${new Date().getTime()}`,
      isActive: true,
    };
    this.sensores.push(newSensor);

    return {
      message: 'Sensor creado correctamente',
      data: sensorPayload,
    };
  }

  delete(id: string) {
    const position = this.sensores.findIndex((sensor) => sensor.id === id);
    if (position === -1) {
      throw new NotFoundException(`Sensor con ID ${id} no existe`);
    }
    this.sensores.splice(position, 1);
    return {
      msg: 'Sensor eliminado correctamente',
    };
  }

  update(id: string, changes: UpdateSensorDto) {
    const position = this.sensores.findIndex((sensor) => sensor.id === id);
    if (position === -1) {
      throw new NotFoundException(`Sensor con ID ${id} no existe`);
    }
    const currentData = this.sensores[position];
    const updateSensor = {
      ...currentData,
      ...changes,
    };
    this.sensores[position] = updateSensor;

    return {
      msg: 'Sensor actualizado',
      data: updateSensor,
    };
  }
}
