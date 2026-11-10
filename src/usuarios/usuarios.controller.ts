import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUsuarioDto, UpdateUsuarioDto } from './usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get('')
  getAllUsuarios() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  getUsuarioById(@Param('id') id: string) {
    return this.usuariosService.findById(id);
  }

  @Get('search/:nombre')
  getUsuarioByNombre(@Param('nombre') nombre: string) {
    return this.usuariosService.search(nombre);
  }

  @Post()
  createUsuario(@Body() usuarioPayload: CreateUsuarioDto) {
    return this.usuariosService.create(usuarioPayload);
  }

  @Delete(':id')
  deleteUsuario(@Param('id') id: string) {
    return this.usuariosService.delete(id);
  }

  @Put(':id')
  updateUsuario(@Param('id') id: string, @Body() changes: UpdateUsuarioDto) {
    return this.usuariosService.update(id, changes);
  }
}
