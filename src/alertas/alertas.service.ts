import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Alerta } from './alerta.model';
import { CreateAlertaDto, UpdateAlertaDto } from './alerta.dto';

@Injectable()
export class AlertasService {
  constructor() {}

  private alertas: Alerta[] = [
    { id: '1', lecturaId: '2', zonaId: '1', nivel: 'Baja', mensaje: 'Humedad de suelo bajo el mínimo en Lote Norte', isActive: true },
    { id: '2', lecturaId: '3', zonaId: '1', nivel: 'Alta', mensaje: 'Humedad ambiental sobre el máximo en Lote Norte', isActive: true },
    { id: '3', lecturaId: '7', zonaId: '3', nivel: 'Alta', mensaje: 'Humedad de suelo sobre el máximo en Invernadero 1', isActive: true },
    { id: '4', lecturaId: '11', zonaId: '5', nivel: 'Baja', mensaje: 'Humedad de suelo bajo el mínimo en Ladera Oriental', isActive: true },
    { id: '5', lecturaId: '14', zonaId: '7', nivel: 'Baja', mensaje: 'Humedad de suelo bajo el mínimo en Vega del Río', isActive: true },
    { id: '6', lecturaId: '9', zonaId: '4', nivel: 'Baja', mensaje: 'Humedad de suelo bajo el mínimo en Invernadero 2', isActive: true },
    { id: '7', lecturaId: '13', zonaId: '6', nivel: 'Baja', mensaje: 'Humedad de suelo cerca del mínimo en Ladera Occidental', isActive: true },
    { id: '8', lecturaId: '5', zonaId: '2', nivel: 'Alta', mensaje: 'Humedad ambiental cerca del máximo en Lote Sur', isActive: true },
    { id: '9', lecturaId: '1', zonaId: '1', nivel: 'Alta', mensaje: 'Humedad de suelo cerca del máximo en Lote Norte', isActive: true },
    { id: '10', lecturaId: '4', zonaId: '2', nivel: 'Baja', mensaje: 'Humedad de suelo cerca del mínimo en Lote Sur', isActive: true },
    { id: '11', lecturaId: '6', zonaId: '3', nivel: 'Baja', mensaje: 'Humedad de suelo cerca del mínimo en Invernadero 1', isActive: true },
    { id: '12', lecturaId: '8', zonaId: '3', nivel: 'Alta', mensaje: 'Humedad ambiental cerca del máximo en Invernadero 1', isActive: true },
    { id: '13', lecturaId: '10', zonaId: '4', nivel: 'Baja', mensaje: 'Humedad ambiental cerca del mínimo en Invernadero 2', isActive: true },
    { id: '14', lecturaId: '12', zonaId: '5', nivel: 'Alta', mensaje: 'Humedad ambiental cerca del máximo en Ladera Oriental', isActive: true },
    { id: '15', lecturaId: '15', zonaId: '8', nivel: 'Alta', mensaje: 'Humedad de suelo sobre el máximo en Potrero Alto', isActive: true },
  ];


  findAll(): Alerta[] {
    // logica de negocio
    return this.alertas.filter((alerta) => alerta.isActive);
  }

  findById(id: string): Alerta | undefined {
    console.log('.:: Alerta ID: ', id);
    const alerta = this.alertas.find((alerta) => alerta.id === id);
    console.log('.:: alerta buscada: ', alerta);
    if (alerta === undefined) {
      // Simulación de alerta no encontrada, error 404
      throw new NotFoundException(`Alerta con ID ${id} no existe`);
    }

    // Simulación para error de permisos
    if (alerta.id === '1') {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la alerta con ID ${id}`,
      );
    }
    return alerta;
  }

  search(nivel: string): Alerta[] {
    const data = this.alertas.filter((alerta) => alerta.nivel === nivel);
    if (data.length === 0) {
      throw new NotFoundException(`Alertas de nivel ${nivel} no existen`);
    }
    return data;
  }

  create(alertaPayload: CreateAlertaDto) {
    const newAlerta = {
      ...alertaPayload,
      id: `${new Date().getTime()}`,
      isActive: true,
    };
    this.alertas.push(newAlerta);

    return {
      message: 'Alerta creada correctamente',
      data: alertaPayload,
    };
  }

  delete(id: string) {
    const position = this.alertas.findIndex((alerta) => alerta.id === id);
    if (position === -1) {
      throw new NotFoundException(`Alerta con ID ${id} no existe`);
    }
    this.alertas.splice(position, 1);
    return {
      msg: 'Alerta eliminada correctamente',
    };
  }

  update(id: string, changes: UpdateAlertaDto) {
    const position = this.alertas.findIndex((alerta) => alerta.id === id);
    if (position === -1) {
      throw new NotFoundException(`Alerta con ID ${id} no existe`);
    }
    const currentData = this.alertas[position];
    const updateAlerta = {
      ...currentData,
      ...changes,
    };
    this.alertas[position] = updateAlerta;

    return {
      msg: 'Alerta actualizada',
      data: updateAlerta,
    };
  }
}
