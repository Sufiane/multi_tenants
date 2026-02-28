import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    name: string;

    @Field()
    @IsNotEmpty()
    @IsEmail({}, { message: 'invalid_email_format' })
    email: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    organizationUuid: string;
}
