import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateLecturaDto, UpdateLecturaDto } from './lectura.dto';
import { LecturasService } from './lecturas.service';

@Controller('lecturas')
export class LecturasController {
  constructor(private lecturasService: LecturasService) {}

  @Get('')
  getAllLecturas() {
    return this.lecturasService.findAll();
  }

  @Get(':id')
  getLecturaById(@Param('id') id: string) {
    return this.lecturasService.findById(id);
  }

  @Get('search/:sensorId')
  getLecturasBySensorId(@Param('sensorId') sensorId: string) {
    return this.lecturasService.search(sensorId);
  }

  @Post()
  createLectura(@Body() lecturaPayload: CreateLecturaDto) {
    return this.lecturasService.create(lecturaPayload);
  }

  @Delete(':id')
  deleteLectura(@Param('id') id: string) {
    return this.lecturasService.delete(id);
  }

  @Put(':id')
  updateLectura(@Param('id') id: string, @Body() changes: UpdateLecturaDto) {
    return this.lecturasService.update(id, changes);
  }
}
