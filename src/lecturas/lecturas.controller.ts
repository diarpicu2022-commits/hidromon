import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateLecturaDto } from './lectura.dto';
import { LecturasService } from './lecturas.service';

@Controller('lecturas')
export class LecturasController {

    constructor(private readonly lecturasService: LecturasService) {}

    @Get()
    getLecturas() {
        return this.lecturasService.findAll();
    }

    @Get('id/:id')
    getLecturaById(@Param('id') id: string) {
        console.log('ID recibido:', id);
        const lectura = this.lecturasService.findById(id);
        console.log('Lectura encontrada:', lectura);
        return lectura;
    }

    @Get('sensor/:sensorId')
    getLecturasBySensor(@Param('sensorId') sensorId: string) {
        console.log('Sensor recibido:', sensorId);
        const lecturas = this.lecturasService.findBySensor(sensorId);
        console.log('Lecturas encontradas:', lecturas);
        return lecturas;
    }

    @Post()
    createLectura(@Body() lecturaPayLoad: CreateLecturaDto) {
        console.log('.:: lectura: ', lecturaPayLoad);
        return this.lecturasService.create(lecturaPayLoad);
    }

    @Delete(':id')
    deleteLectura(@Param('id') id: string) {
        this.lecturasService.delete(id);
        return {
            msg: "Lectura eliminada correctamente"
        }
    }

    @Put(':id')
    updateLectura(@Param('id') id: string, @Body() changes: CreateLecturaDto) {
        const updatedLectura = this.lecturasService.update(id, changes);
        return {
            msg: "Lectura actualizada correctamente",
            data: updatedLectura
        }
    }

}
