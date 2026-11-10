import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Perfil } from './entities/perfil.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Perfil])],
    controllers: [UsuariosController],
    providers: [UsuariosService],
})
export class UsuariosModule {}
