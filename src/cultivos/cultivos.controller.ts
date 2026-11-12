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
import { CreateCultivoDto, UpdateCultivoDto } from './dtos/cultivo.dto';
import { CultivosService } from './cultivos.service';

@Controller('cultivos')
export class CultivosController {
  constructor(private cultivosService: CultivosService) {}

  @Get('')
  getAllCultivos() {
    return this.cultivosService.findAll();
  }

  @Get(':id')
  getCultivoById(@Param('id', ParseIntPipe) id: number) {
    return this.cultivosService.findById(id);
  }

  @Post()
  createCultivo(@Body() cultivoPayload: CreateCultivoDto) {
    return this.cultivosService.create(cultivoPayload);
  }

  @Delete(':id')
  deleteCultivo(@Param('id', ParseIntPipe) id: number) {
    return this.cultivosService.delete(id);
  }

  @Put(':id')
  updateCultivo(@Param('id', ParseIntPipe) id: number, @Body() changes: UpdateCultivoDto) {
    return this.cultivosService.update(id, changes);
  }
}
