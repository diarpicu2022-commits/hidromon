import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateAlertaDto, UpdateAlertaDto } from './dtos/alerta.dto';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private alertasService: AlertasService) {}

  @Get('')
  getAllAlertas(
    @Query('resuelta', new ParseBoolPipe({ optional: true })) resuelta?: boolean,
  ) {
    return this.alertasService.findAll(resuelta);
  }

  @Get(':id')
  getAlertaById(@Param('id', ParseIntPipe) id: number) {
    return this.alertasService.findById(id);
  }

  @Get('search/:nivel')
  getAlertasByNivel(@Param('nivel') nivel: string) {
    return this.alertasService.search(nivel);
  }

  @Patch(':id/resolver')
  resolveAlerta(@Param('id', ParseIntPipe) id: number) {
    return this.alertasService.resolve(id);
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
