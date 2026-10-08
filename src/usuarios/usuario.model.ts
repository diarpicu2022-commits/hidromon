export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  isActive?: boolean;
  nickname?: string;
}
