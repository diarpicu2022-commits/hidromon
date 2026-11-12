import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

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

    @IsInt()
    @IsPositive()
    @IsOptional()
    usuarioId?: number | null;
}

export class UpdateZonaDto extends PartialType(CreateZonaDto) {}
