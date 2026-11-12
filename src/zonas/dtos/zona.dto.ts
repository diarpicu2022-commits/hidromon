import { OmitType, PartialType } from "@nestjs/mapped-types";
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateUbicacionDto, UpdateUbicacionDto } from "./ubicacion.dto";

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

    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @IsOptional()
    cultivoIds?: number[];

    @ValidateNested()
    @Type(() => CreateUbicacionDto)
    @IsNotEmpty()
    ubicacion: CreateUbicacionDto;
}

// Clase 7d: la ubicación va anidada. Al crear es obligatoria y al editar se corrige por partes.
export class UpdateZonaDto extends PartialType(OmitType(CreateZonaDto, ['ubicacion'])) {

    @ValidateNested()
    @Type(() => UpdateUbicacionDto)
    @IsOptional()
    ubicacion?: UpdateUbicacionDto;
}
