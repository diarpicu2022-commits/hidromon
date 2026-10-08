import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateAlertaDto } from './alerta.dto';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {

    constructor(private readonly alertasService: AlertasService) {}

    @Get()
    getAlertas() {
        return this.alertasService.findAll();
    }

    @Get('id/:id')
    getAlertaById(@Param('id') id: string) {
        console.log('ID recibido:', id);
        const alerta = this.alertasService.findById(id);
        console.log('Alerta encontrada:', alerta);
        return alerta;
    }

    @Get('nivel/:nivel')
    getAlertasByNivel(@Param('nivel') nivel: string) {
        console.log('Nivel recibido:', nivel);
        const alertas = this.alertasService.findByNivel(nivel);
        console.log('Alertas encontradas:', alertas);
        return alertas;
    }

    @Post()
    createAlerta(@Body() alertaPayLoad: CreateAlertaDto) {
        console.log('.:: alerta: ', alertaPayLoad);
        return this.alertasService.create(alertaPayLoad);
    }

    @Delete(':id')
    deleteAlerta(@Param('id') id: string) {
        this.alertasService.delete(id);
        return {
            msg: "Alerta eliminada correctamente"
        }
    }

    @Put(':id')
    updateAlerta(@Param('id') id: string, @Body() changes: CreateAlertaDto) {
        const updatedAlerta = this.alertasService.update(id, changes);
        return {
            msg: "Alerta actualizada correctamente",
            data: updatedAlerta
        }
    }

}
