import { IsString, IsOptional, IsBoolean, IsArray, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateResourceDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsString()
    studyTime?: string;

    @IsOptional()
    @IsIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    difficulty?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map((tag) => tag.trim()).filter(Boolean);
            }
        }
        return value;
    })
    tags?: string[];

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    featured?: boolean;

    @IsOptional()
    @IsIn(['draft', 'published'])
    status?: string;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @IsOptional()
    @IsString()
    downloadUrl?: string;

    @IsOptional()
    @IsString()
    externalUrl?: string;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    rating?: number;
}
