import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUsuarioDto } from './usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {

    constructor(private readonly usuariosService: UsuariosService) {}

    @Get()
    getUsuarios() {
        return this.usuariosService.findAll();
    }

    @Get('id/:id')
    getUsuarioById(@Param('id') id: string) {
        console.log('ID recibido:', id);
        const usuario = this.usuariosService.findById(id);
        console.log('Usuario encontrado:', usuario);
        return usuario;
    }

    @Get('nombre/:nombre')
    getUsuarioByNombre(@Param('nombre') nombre: string) {
        console.log('Nombre recibido:', nombre);
        const usuario = this.usuariosService.findByNombre(nombre);
        console.log('Usuario encontrado:', usuario);
        return usuario;
    }

    @Post()
    createUsuario(@Body() usuarioPayLoad: CreateUsuarioDto) {
        console.log('.:: usuario: ', usuarioPayLoad);
        return this.usuariosService.create(usuarioPayLoad);
    }

    @Delete(':id')
    deleteUsuario(@Param('id') id: string) {
        this.usuariosService.delete(id);
        return {
            msg: "Usuario eliminado correctamente"
        }
    }

    @Put(':id')
    updateUsuario(@Param('id') id: string, @Body() changes: CreateUsuarioDto) {
        const updatedUsuario = this.usuariosService.update(id, changes);
        return {
            msg: "Usuario actualizado correctamente",
            data: updatedUsuario
        }
    }

}
