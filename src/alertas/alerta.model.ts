export interface Alerta {
  id: string;
  lecturaId: string;
  zonaId: string;
  nivel: string;
  mensaje: string;
  isActive?: boolean;
}
