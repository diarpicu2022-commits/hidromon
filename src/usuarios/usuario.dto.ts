import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

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
@IsString()
@IsNotEmpty()
@Length( 3, 8)
nickname?: string;
}
