import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateFichaTecnicaDto, UpdateFichaTecnicaDto } from "./ficha-tecnica.dto";

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

    @ValidateNested()
    @Type(() => CreateFichaTecnicaDto)
    @IsNotEmpty()
    fichaTecnica: CreateFichaTecnicaDto;
}

// Clase 7d: la ficha va anidada. Al crear es obligatoria y al editar se corrige por partes.
export class UpdateSensorDto extends PartialType(OmitType(CreateSensorDto, ['fichaTecnica'])) {

    @ValidateNested()
    @Type(() => UpdateFichaTecnicaDto)
    @IsOptional()
    fichaTecnica?: UpdateFichaTecnicaDto;
}
