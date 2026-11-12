import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Zona } from './zona.model';
import { CreateZonaDto, UpdateZonaDto } from './zona.dto';

@Injectable()
export class ZonasService {
  constructor() {}

  private zonas: Zona[] = [
    { id: '1', nombre: 'Lote Norte', cultivo: 'Papa', humedadMin: 60, humedadMax: 80, isActive: true },
    { id: '2', nombre: 'Lote Sur', cultivo: 'Papa', humedadMin: 60, humedadMax: 80, isActive: true },
    { id: '3', nombre: 'Invernadero 1', cultivo: 'Tomate', humedadMin: 65, humedadMax: 85, isActive: true },
    { id: '4', nombre: 'Invernadero 2', cultivo: 'Tomate', humedadMin: 65, humedadMax: 85, isActive: true },
    { id: '5', nombre: 'Ladera Oriental', cultivo: 'Café', humedadMin: 55, humedadMax: 75, isActive: true },
    { id: '6', nombre: 'Ladera Occidental', cultivo: 'Café', humedadMin: 55, humedadMax: 75, isActive: true },
    { id: '7', nombre: 'Vega del Río', cultivo: 'Maíz', humedadMin: 50, humedadMax: 70, isActive: true },
    { id: '8', nombre: 'Potrero Alto', cultivo: 'Maíz', humedadMin: 50, humedadMax: 70, isActive: true },
    { id: '9', nombre: 'Huerta Central', cultivo: 'Cebolla', humedadMin: 60, humedadMax: 75, isActive: true },
    { id: '10', nombre: 'Lote Quebrada', cultivo: 'Fríjol', humedadMin: 55, humedadMax: 70, isActive: true },
    { id: '11', nombre: 'Cancha Vieja', cultivo: 'Arveja', humedadMin: 60, humedadMax: 75, isActive: true },
    { id: '12', nombre: 'Invernadero 3', cultivo: 'Fresa', humedadMin: 70, humedadMax: 85, isActive: true },
    { id: '13', nombre: 'Terraza Baja', cultivo: 'Plátano', humedadMin: 65, humedadMax: 85, isActive: true },
    { id: '14', nombre: 'Lote Camino', cultivo: 'Zanahoria', humedadMin: 60, humedadMax: 80, isActive: true },
    { id: '15', nombre: 'Huerta Escolar', cultivo: 'Lechuga', humedadMin: 70, humedadMax: 90, isActive: true },
  ];


  findAll(): Zona[] {
    // logica de negocio
    return this.zonas.filter((zona) => zona.isActive);
  }

  findById(id: string): Zona | undefined {
    console.log('.:: Zona ID: ', id);
    const zona = this.zonas.find((zona) => zona.id === id);
    console.log('.:: zona buscada: ', zona);
    if (zona === undefined) {
      // Simulación de zona no encontrada, error 404
      throw new NotFoundException(`Zona con ID ${id} no existe`);
    }

    // Simulación para error de permisos
    if (zona.id === '1') {
      throw new ForbiddenException(
        `No tienes permisos para acceder a la zona con ID ${id}`,
      );
    }
    return zona;
  }

  search(cultivo: string): Zona[] {
    const data = this.zonas.filter((zona) => zona.cultivo === cultivo);
    if (data.length === 0) {
      throw new NotFoundException(`Zonas con cultivo ${cultivo} no existen`);
    }
    return data;
  }

  create(zonaPayload: CreateZonaDto) {
    const newZona = {
      ...zonaPayload,
      id: `${new Date().getTime()}`,
      isActive: true,
    };
    this.zonas.push(newZona);

    return {
      message: 'Zona creada correctamente',
      data: zonaPayload,
    };
  }

  delete(id: string) {
    const position = this.zonas.findIndex((zona) => zona.id === id);
    if (position === -1) {
      throw new NotFoundException(`Zona con ID ${id} no existe`);
    }
    this.zonas.splice(position, 1);
    return {
      msg: 'Zona eliminada correctamente',
    };
  }

  update(id: string, changes: UpdateZonaDto) {
    const position = this.zonas.findIndex((zona) => zona.id === id);
    if (position === -1) {
      throw new NotFoundException(`Zona con ID ${id} no existe`);
    }
    const currentData = this.zonas[position];
    const updateZona = {
      ...currentData,
      ...changes,
    };
    this.zonas[position] = updateZona;

    return {
      msg: 'Zona actualizada',
      data: updateZona,
    };
  }
}
