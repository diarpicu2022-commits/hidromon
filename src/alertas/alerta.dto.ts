import { IsNotEmpty, IsString } from "class-validator";

export class CreateAlertaDto {
@IsString()
@IsNotEmpty()
lecturaId: string;
@IsString()
@IsNotEmpty()
zonaId: string;
@IsString()
@IsNotEmpty()
nivel: string;
@IsString()
@IsNotEmpty()
mensaje: string;
}

export class UpdateAlertaDto {
@IsString()
@IsNotEmpty()
lecturaId: string;
@IsString()
@IsNotEmpty()
zonaId: string;
@IsString()
@IsNotEmpty()
nivel: string;
@IsString()
@IsNotEmpty()
mensaje: string;
}
