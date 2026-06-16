import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMasteryDto {
  @ApiProperty({ description: 'ID do nó do grafo', example: 'M1' })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({
    description: 'Tipo do evento de avaliação',
    enum: ['correct', 'incorrect', 'correct_with_hint'],
    example: 'correct',
  })
  @IsString()
  @IsIn(['correct', 'incorrect', 'correct_with_hint'])
  event: 'correct' | 'incorrect' | 'correct_with_hint';
}
