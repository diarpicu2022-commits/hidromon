import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateAlertaDto, UpdateAlertaDto } from './alerta.dto';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private alertasService: AlertasService) {}

  @Get('')
  getAllAlertas() {
    return this.alertasService.findAll();
  }

  @Get(':id')
  getAlertaById(@Param('id') id: string) {
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
  deleteAlerta(@Param('id') id: string) {
    return this.alertasService.delete(id);
  }

  @Put(':id')
  updateAlerta(@Param('id') id: string, @Body() changes: UpdateAlertaDto) {
    return this.alertasService.update(id, changes);
  }
}
