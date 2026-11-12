import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateZonaDto, UpdateZonaDto } from './zona.dto';
import { ZonasService } from './zonas.service';

@Controller('zonas')
export class ZonasController {
  constructor(private zonasService: ZonasService) {}

  @Get('')
  getAllZonas() {
    return this.zonasService.findAll();
  }

  @Get(':id')
  getZonaById(@Param('id') id: string) {
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
  deleteZona(@Param('id') id: string) {
    return this.zonasService.delete(id);
  }

  @Put(':id')
  updateZona(@Param('id') id: string, @Body() changes: UpdateZonaDto) {
    return this.zonasService.update(id, changes);
  }
}
