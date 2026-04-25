import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ClientStatusEnum {
  ACTIVE = 'ACTIVE',
  LEAD = 'LEAD',
  INACTIVE = 'INACTIVE',
}

export class CreateClientDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsEnum(ClientStatusEnum)
  status?: ClientStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
