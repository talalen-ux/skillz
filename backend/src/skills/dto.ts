import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PricingModel } from '@prisma/client';

export class CreateSkillDto {
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @IsString() @MinLength(10) @MaxLength(2000) description!: string;
  @IsString() @MaxLength(40) category!: string;
  @IsEnum(PricingModel) pricingModel!: PricingModel;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(10) tags?: string[];
  @IsObject() permissionsRequired!: Record<string, unknown>;
  @IsString() @MinLength(1) code!: string;
  @IsOptional() @IsObject() manifest?: Record<string, unknown>;
}

export class UpdateSkillDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(40) category?: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class PublishVersionDto {
  @IsString() code!: string;
  @IsOptional() @IsObject() manifest?: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(500) changelog?: string;
  @IsOptional() @IsObject() permissionsRequired?: Record<string, unknown>;
}

export class ListSkillsQuery {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() certification?: string;
  @IsOptional() @IsString() pricingModel?: string;
  @IsOptional() @IsString() sort?: 'rating' | 'recent' | 'popular' | 'price';
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) limit?: number;
}
