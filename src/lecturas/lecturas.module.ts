import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturasController } from './lecturas.controller';
import { LecturasService } from './lecturas.service';
import { Lectura } from './entities/lectura.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lectura])],
    controllers: [LecturasController],
    providers: [LecturasService],
})
export class LecturasModule {}
