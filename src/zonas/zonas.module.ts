import { Module } from '@nestjs/common';
import { ZonasController } from './zonas.controller';
import { ZonasService } from './zonas.service';

@Module({
    imports: [],
    controllers: [ZonasController],
    providers: [ZonasService],
})
export class ZonasModule {}
