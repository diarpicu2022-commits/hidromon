import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateAlertaDto, UpdateAlertaDto } from './dtos/alerta.dto';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private alertasService: AlertasService) {}

  @Get('')
  getAllAlertas() {
    return this.alertasService.findAll();
  }

  @Get(':id')
  getAlertaById(@Param('id', ParseIntPipe) id: number) {
    return this.alertasService.findById(id);
  }

  @Get('search/:nivel')
  getAlertasByNivel(@Param('nivel') nivel: string) {
    return this.alertasService.search(nivel);
  }

  @Post()
  createAlerta(@Body() alertaPayload: CreateAlertaDto) {
    return this.alertasService.create(alertaPayload);
  }

  @Delete(':id')
  deleteAlerta(@Param('id', ParseIntPipe) id: number) {
    return this.alertasService.delete(id);
  }

  @Put(':id')
  updateAlerta(@Param('id', ParseIntPipe) id: number, @Body() changes: UpdateAlertaDto) {
    return this.alertasService.update(id, changes);
  }
}
