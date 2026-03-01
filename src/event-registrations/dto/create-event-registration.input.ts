import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateEventRegistrationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  userUuid: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  eventUuid: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  organizationUuid: string;
}

