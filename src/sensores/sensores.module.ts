import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensoresController } from './sensores.controller';
import { SensoresService } from './sensores.service';
import { Sensor } from './entities/sensor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Sensor])],
    controllers: [SensoresController],
    providers: [SensoresService],
})
export class SensoresModule {}
