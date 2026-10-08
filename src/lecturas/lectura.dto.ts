import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateLecturaDto {
@IsString()
@IsNotEmpty()
sensorId: string;
@IsNumber()
@IsPositive()
valor: number;
@IsString()
@IsNotEmpty()
fecha: string;
}

export class UpdateLecturaDto {
@IsString()
@IsNotEmpty()
sensorId: string;
@IsNumber()
@IsPositive()
valor: number;
@IsString()
@IsNotEmpty()
fecha: string;
}
