import { Module } from '@nestjs/common';
import { LecturasController } from './lecturas.controller';
import { LecturasService } from './lecturas.service';

@Module({
    imports: [],
    controllers: [LecturasController],
    providers: [LecturasService],
})
export class LecturasModule {}
