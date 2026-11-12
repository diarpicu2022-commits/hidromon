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
import { CreateLecturaDto, UpdateLecturaDto } from './dtos/lectura.dto';
import { LecturasService } from './lecturas.service';

@Controller('lecturas')
export class LecturasController {
  constructor(private lecturasService: LecturasService) {}

  @Get('')
  getAllLecturas() {
    return this.lecturasService.findAll();
  }

  @Get(':id')
  getLecturaById(@Param('id', ParseIntPipe) id: number) {
    return this.lecturasService.findById(id);
  }

  @Get('search/:sensorId')
  getLecturasBySensorId(@Param('sensorId', ParseIntPipe) sensorId: number) {
    return this.lecturasService.search(sensorId);
  }

  @Post()
  createLectura(@Body() lecturaPayload: CreateLecturaDto) {
    return this.lecturasService.create(lecturaPayload);
  }

  @Delete(':id')
  deleteLectura(@Param('id', ParseIntPipe) id: number) {
    return this.lecturasService.delete(id);
  }

  @Put(':id')
  updateLectura(@Param('id', ParseIntPipe) id: number, @Body() changes: UpdateLecturaDto) {
    return this.lecturasService.update(id, changes);
  }
}
