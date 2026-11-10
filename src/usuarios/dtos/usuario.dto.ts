import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CreatePerfilDto } from "./perfil.dto";
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

export class UpdateUsuarioDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    rol: string;
}
