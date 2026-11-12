import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateSensorDto, UpdateSensorDto } from './sensor.dto';
import { SensoresService } from './sensores.service';

@Controller('sensores')
export class SensoresController {
  constructor(private sensoresService: SensoresService) {}

  @Get('')
  getAllSensores() {
    return this.sensoresService.findAll();
  }

  @Get(':id')
  getSensorById(@Param('id') id: string) {
    return this.sensoresService.findById(id);
  }

  @Get('search/:tipo')
  getSensoresByTipo(@Param('tipo') tipo: string) {
    return this.sensoresService.search(tipo);
  }

  @Post()
  createSensor(@Body() sensorPayload: CreateSensorDto) {
    return this.sensoresService.create(sensorPayload);
  }

  @Delete(':id')
  deleteSensor(@Param('id') id: string) {
    return this.sensoresService.delete(id);
  }

  @Put(':id')
  updateSensor(@Param('id') id: string, @Body() changes: UpdateSensorDto) {
    return this.sensoresService.update(id, changes);
  }
}
