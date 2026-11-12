import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateUbicacionDto {

    @IsString()
    @IsNotEmpty()
    municipio: string;

    @IsString()
    @IsOptional()
    vereda?: string | null;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitud: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitud: number;
}

export class UpdateUbicacionDto extends PartialType(CreateUbicacionDto) {}
