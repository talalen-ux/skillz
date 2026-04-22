import { IsObject, IsOptional } from 'class-validator';

export class ExecuteSkillDto {
  @IsObject() inputs!: Record<string, unknown>;
  @IsOptional() @IsObject() runtime?: Record<string, unknown>;
}
