import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivosController } from './cultivos.controller';
import { CultivosService } from './cultivos.service';
import { Cultivo } from './entities/cultivo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cultivo])],
    controllers: [CultivosController],
    providers: [CultivosService],
})
export class CultivosModule {}
