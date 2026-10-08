import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateSensorDto } from './sensor.dto';
import { SensoresService } from './sensores.service';

@Controller('sensores')
export class SensoresController {

    constructor(private readonly sensoresService: SensoresService) {}

    @Get()
    getSensores() {
        return this.sensoresService.findAll();
    }

    @Get('id/:id')
    getSensorById(@Param('id') id: string) {
        console.log('ID recibido:', id);
        const sensor = this.sensoresService.findById(id);
        console.log('Sensor encontrado:', sensor);
        return sensor;
    }

    @Get('tipo/:tipo')
    getSensoresByTipo(@Param('tipo') tipo: string) {
        console.log('Tipo recibido:', tipo);
        const sensores = this.sensoresService.findByTipo(tipo);
        console.log('Sensores encontrados:', sensores);
        return sensores;
    }

    @Post()
    createSensor(@Body() sensorPayLoad: CreateSensorDto) {
        console.log('.:: sensor: ', sensorPayLoad);
        return this.sensoresService.create(sensorPayLoad);
    }

    @Delete(':id')
    deleteSensor(@Param('id') id: string) {
        this.sensoresService.delete(id);
        return {
            msg: "Sensor eliminado correctamente"
        }
    }

    @Put(':id')
    updateSensor(@Param('id') id: string, @Body() changes: CreateSensorDto) {
        const updatedSensor = this.sensoresService.update(id, changes);
        return {
            msg: "Sensor actualizado correctamente",
            data: updatedSensor
        }
    }

}
