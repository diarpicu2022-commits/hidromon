import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCultivoDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string | null;
}

export class UpdateCultivoDto extends PartialType(CreateCultivoDto) {}
