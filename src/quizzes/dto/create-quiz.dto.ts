import { IsString, IsArray, ArrayMinSize } from 'class-validator';
import { IsMongoId } from 'class-validator';

export class CreateQuizDto {
  @IsMongoId()
  lessonId: string;

  @IsString()
  question: string;

  @IsArray()
  @ArrayMinSize(2)
  options: string[];

  @IsString()
  correctAnswer: string;
}
