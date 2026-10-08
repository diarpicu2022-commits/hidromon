export interface Zona {
  id: string;
  nombre: string;
  cultivo: string;
  humedadMin: number;
  humedadMax: number;
  isActive?: boolean;
}
