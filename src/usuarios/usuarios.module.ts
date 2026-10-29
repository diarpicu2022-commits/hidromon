import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
    imports: [],
    controllers: [UsuariosController],
    providers: [UsuariosService],
})
export class UsuariosModule {}
