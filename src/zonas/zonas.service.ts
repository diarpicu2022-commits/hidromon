import { Injectable, NotFoundException } from '@nestjs/common';
import { Zona } from './zona.model';
import { CreateZonaDto } from './zona.dto';

@Injectable()
export class ZonasService {

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
    { id: '15', nombre: 'Huerta Escolar', cultivo: 'Lechuga', humedadMin: 70, humedadMax: 90, isActive: true }
  ];

  findAll(): Zona[] {
    return this.zonas.filter(zona => zona.isActive);
  }

  findById(id: string): Zona | undefined {
    console.log('.:: Zona ID:', id);
    const zona = this.zonas.find((zona) => zona.id === id);
    if (zona === undefined) {
      // Simulacion de zona no encontrada
      throw new NotFoundException(`Zona con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder a la zona con ID ${id}`);
    }
    return zona;
  }

  findByCultivo(cultivo: string): Zona[] {
    const zonas = this.zonas.filter(zona => zona.cultivo === cultivo);
    if (zonas.length === 0) {
      //simulacion para el cultivo no existe
      throw new NotFoundException(`Zonas con cultivo ${cultivo} no existen`);

      // Simulacion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para acceder a las zonas con cultivo ${cultivo}`);
    }
    return zonas;
  }

  create(zonaPayLoad: CreateZonaDto): Zona {
    const newZona: Zona = {
      ...zonaPayLoad,
      id: `${new Date().getTime()}`,
      isActive: true
    };
    this.zonas.push(newZona);
    return newZona;
  }

  delete(id: string) {
    const position = this.findPosition(id);
    this.zonas.splice(position, 1);
    return { msg: `Zona eliminada correctamente` };
  }

  update(id: string, changes: CreateZonaDto) {
    const position = this.findPosition(id);
    const updatedZona = { ...this.zonas[position], ...changes };
    this.zonas[position] = updatedZona;
    return updatedZona;
  }

  private findPosition(id: string): number {
    const position = this.zonas.findIndex((zona) => zona.id === id);
    if (position === -1) {
      // Simulacion de zona no encontrada
      throw new NotFoundException(`Zona con ID ${id} no existe`);

      //Simualcion para error de permisos
      //throw new ForbiddenException(`No tienes permisos para modificar la zona con ID ${id}`);
    }
    return position;
  }
}
