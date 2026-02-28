import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Organization {
    @Field()
    id: string;

    @Field()
    name: string;

    @Field()
    uuid: string;
}
