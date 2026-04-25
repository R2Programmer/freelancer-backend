import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatusEnum } from './create-client.dto';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

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
