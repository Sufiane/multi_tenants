import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: false,
            graphiql: false,
            autoSchemaFile: true,
            sortSchema: true,
        }),
        PrismaModule,
        OrganizationModule,
        UserModule,
        EventModule,
    ],
})
export class AppModule {
}
