import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'hidromon-nestjs',
    }),
  ],
  controllers: [AppController, UsuariosController, SensoresController, ZonasController, LecturasController, AlertasController],
  providers: [AppService, UsuariosService, SensoresService, ZonasService, LecturasService, AlertasService],
})
export class AppModule {}
