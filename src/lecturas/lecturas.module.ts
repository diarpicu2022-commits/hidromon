import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturasController } from './lecturas.controller';
import { LecturasService } from './lecturas.service';
import { Lectura } from './entities/lectura.entity';
import { Sensor } from '../sensores/entities/sensor.entity';
import { Alerta } from '../alertas/entities/alerta.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lectura, Sensor, Alerta])],
    controllers: [LecturasController],
    providers: [LecturasService],
})
export class LecturasModule {}
