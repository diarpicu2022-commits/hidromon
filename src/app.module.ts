import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuariosController } from './usuarios/usuarios.controller';
import { SensoresController } from './sensores/sensores.controller';
import { ZonasController } from './zonas/zonas.controller';
import { LecturasController } from './lecturas/lecturas.controller';
import { AlertasController } from './alertas/alertas.controller';
import { UsuariosService } from './usuarios/usuarios.service';
import { SensoresService } from './sensores/sensores.service';
import { ZonasService } from './zonas/zonas.service';
import { LecturasService } from './lecturas/lecturas.service';
import { AlertasService } from './alertas/alertas.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UsuariosController, SensoresController, ZonasController, LecturasController, AlertasController],
  providers: [UsuariosService, SensoresService, ZonasService, LecturasService, AlertasService],
})
export class AppModule {}
