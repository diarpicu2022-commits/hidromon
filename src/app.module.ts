import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SensoresController } from './sensores/sensores.controller';
import { ZonasController } from './zonas/zonas.controller';
import { LecturasController } from './lecturas/lecturas.controller';
import { AlertasController } from './alertas/alertas.controller';
import { SensoresService } from './sensores/sensores.service';
import { ZonasService } from './zonas/zonas.service';
import { LecturasService } from './lecturas/lecturas.service';
import { AlertasService } from './alertas/alertas.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: Number(configService.getOrThrow('POSTGRES_PORT')),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        database: configService.getOrThrow('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [],
      }),
      inject: [ConfigService],
    }),
    UsuariosModule,
  ],
  controllers: [SensoresController, ZonasController, LecturasController, AlertasController],
  providers: [SensoresService, ZonasService, LecturasService, AlertasService],
})
export class AppModule {}
