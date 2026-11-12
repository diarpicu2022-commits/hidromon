import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePerfilDto {
    @IsString()
    @IsNotEmpty()
    municipio: string;

    @IsString()
    @IsNotEmpty()
    finca: string;

    @IsString()
    @IsOptional()
    nickname: string;

    @IsString()
    @IsOptional()
    avatar: string;
}

export class UpdatePerfilDto extends PartialType(CreatePerfilDto) {}
