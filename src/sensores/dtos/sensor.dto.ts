import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateSensorDto {

    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    tipo: string;

    @IsInt()
    @IsPositive()
    zonaId: number;
}

export class UpdateSensorDto extends PartialType(CreateSensorDto) {}
