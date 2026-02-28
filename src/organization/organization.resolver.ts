import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { OrganizationService } from './organization.service';
import { Organization } from './object-type/organization.type';
import { CreateOrganizationInput } from './dto/create-organization.input';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly organizationService: OrganizationService) {}

  @Mutation(() => Organization)
  async createOrganization(
    @Args('createOrganizationInput') createOrganizationInput: CreateOrganizationInput,
  ): Promise<Organization> {
    return this.organizationService.create(createOrganizationInput);
  }

  @Query(() => [Organization], { name: 'organizations' })
  findAll(): Promise<Organization[]> {
    return this.organizationService.findAll();
  }
}
