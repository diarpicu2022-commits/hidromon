import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateZonaDto } from './zona.dto';
import { ZonasService } from './zonas.service';

@Controller('zonas')
export class ZonasController {

    constructor(private readonly zonasService: ZonasService) {}

    @Get()
    getZonas() {
        return this.zonasService.findAll();
    }

    @Get('id/:id')
    getZonaById(@Param('id') id: string) {
        console.log('ID recibido:', id);
        const zona = this.zonasService.findById(id);
        console.log('Zona encontrada:', zona);
        return zona;
    }

    @Get('cultivo/:cultivo')
    getZonasByCultivo(@Param('cultivo') cultivo: string) {
        console.log('Cultivo recibido:', cultivo);
        const zonas = this.zonasService.findByCultivo(cultivo);
        console.log('Zonas encontradas:', zonas);
        return zonas;
    }

    @Post()
    createZona(@Body() zonaPayLoad: CreateZonaDto) {
        console.log('.:: zona: ', zonaPayLoad);
        return this.zonasService.create(zonaPayLoad);
    }

    @Delete(':id')
    deleteZona(@Param('id') id: string) {
        this.zonasService.delete(id);
        return {
            msg: "Zona eliminada correctamente"
        }
    }

    @Put(':id')
    updateZona(@Param('id') id: string, @Body() changes: CreateZonaDto) {
        const updatedZona = this.zonasService.update(id, changes);
        return {
            msg: "Zona actualizada correctamente",
            data: updatedZona
        }
    }

}
