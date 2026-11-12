import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreatePerfilDto, UpdatePerfilDto } from "./perfil.dto";
import { Type } from "class-transformer";

export class CreateUsuarioDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    rol: string;

    @ValidateNested()
    @Type(() => CreatePerfilDto)
    @IsNotEmpty()
    perfil: CreatePerfilDto;
}

// Como en la Clase 7d: los campos del usuario son opcionales y el perfil se corrige anidado.
export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['perfil'])) {

    @ValidateNested()
    @Type(() => UpdatePerfilDto)
    @IsOptional()
    perfil?: UpdatePerfilDto;
}
