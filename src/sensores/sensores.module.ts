import { Module } from '@nestjs/common';
import { SensoresController } from './sensores.controller';
import { SensoresService } from './sensores.service';

@Module({
    imports: [],
    controllers: [SensoresController],
    providers: [SensoresService],
})
export class SensoresModule {}
