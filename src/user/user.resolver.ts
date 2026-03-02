import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './object-type/user.type';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Query(() => User)
  async getUser(@Args('uuid') uuid: string): Promise<User> {
    return this.userService.find(uuid);
  }
}
