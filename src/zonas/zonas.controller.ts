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
import { CreateZonaDto, UpdateZonaDto } from './dtos/zona.dto';
import { ZonasService } from './zonas.service';

@Controller('zonas')
export class ZonasController {
  constructor(private zonasService: ZonasService) {}

  @Get('')
  getAllZonas() {
    return this.zonasService.findAll();
  }

  @Get(':id')
  getZonaById(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.findById(id);
  }

  @Get('search/:cultivo')
  getZonasByCultivo(@Param('cultivo') cultivo: string) {
    return this.zonasService.search(cultivo);
  }

  @Post()
  createZona(@Body() zonaPayload: CreateZonaDto) {
    return this.zonasService.create(zonaPayload);
  }

  @Delete(':id')
  deleteZona(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.delete(id);
  }

  @Put(':id')
  updateZona(@Param('id', ParseIntPipe) id: number, @Body() changes: UpdateZonaDto) {
    return this.zonasService.update(id, changes);
  }
}
