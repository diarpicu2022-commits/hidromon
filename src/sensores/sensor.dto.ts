import { IsNotEmpty, IsString } from "class-validator";

export class CreateSensorDto {
@IsString()
@IsNotEmpty()
codigo: string;
@IsString()
@IsNotEmpty()
tipo: string;
@IsString()
@IsNotEmpty()
zonaId: string;
}

export class UpdateSensorDto {
@IsString()
@IsNotEmpty()
codigo: string;
@IsString()
@IsNotEmpty()
tipo: string;
@IsString()
@IsNotEmpty()
zonaId: string;
}
