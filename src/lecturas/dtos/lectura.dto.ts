import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CreateLecturaDto {

    @IsInt()
    @IsPositive()
    sensorId: number;

    @IsNumber()
    valor: number;

    @IsDateString()
    @IsOptional()
    fecha?: string;
}

export class UpdateLecturaDto extends PartialType(CreateLecturaDto) {}
