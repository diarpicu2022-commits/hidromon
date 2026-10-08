import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateZonaDto {
@IsString()
@IsNotEmpty()
nombre: string;
@IsString()
@IsNotEmpty()
cultivo: string;
@IsNumber()
@IsPositive()
humedadMin: number;
@IsNumber()
@IsPositive()
humedadMax: number;
}

export class UpdateZonaDto {
@IsString()
@IsNotEmpty()
nombre: string;
@IsString()
@IsNotEmpty()
cultivo: string;
@IsNumber()
@IsPositive()
humedadMin: number;
@IsNumber()
@IsPositive()
humedadMax: number;
}
