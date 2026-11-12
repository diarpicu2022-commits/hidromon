import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateAlertaDto {

    @IsInt()
    @IsPositive()
    lecturaId: number;

    @IsInt()
    @IsPositive()
    zonaId: number;

    @IsString()
    @IsNotEmpty()
    nivel: string;

    @IsString()
    @IsNotEmpty()
    mensaje: string;
}

export class UpdateAlertaDto extends PartialType(CreateAlertaDto) {}
