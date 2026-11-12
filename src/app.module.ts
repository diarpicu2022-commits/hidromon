import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ZonasModule } from './zonas/zonas.module';
import { LecturasModule } from './lecturas/lecturas.module';
import { AlertasModule } from './alertas/alertas.module';
import { SensoresModule } from './sensores/sensores.module';

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
    SensoresModule,
    ZonasModule,
    LecturasModule,
    AlertasModule,
  ],
})
export class AppModule {}
