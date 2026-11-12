import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFichaTecnicaDto {

    @IsString()
    @IsNotEmpty()
    marca: string;

    @IsString()
    @IsNotEmpty()
    modelo: string;

    @IsString()
    @IsOptional()
    numeroSerie?: string | null;

    @IsDateString()
    @IsOptional()
    fechaInstalacion?: string | null;
}

export class UpdateFichaTecnicaDto extends PartialType(CreateFichaTecnicaDto) {}
