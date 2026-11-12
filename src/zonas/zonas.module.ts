import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonasController } from './zonas.controller';
import { ZonasService } from './zonas.service';
import { Zona } from './entities/zona.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Zona])],
    controllers: [ZonasController],
    providers: [ZonasService],
})
export class ZonasModule {}
