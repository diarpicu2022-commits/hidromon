import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonasController } from './zonas.controller';
import { ZonasService } from './zonas.service';
import { Zona } from './entities/zona.entity';
import { Ubicacion } from './entities/ubicacion.entity';
import { Cultivo } from '../cultivos/entities/cultivo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Zona, Ubicacion, Cultivo])],
    controllers: [ZonasController],
    providers: [ZonasService],
})
export class ZonasModule {}
