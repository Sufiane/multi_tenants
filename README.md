# multi_tenants


### Setup

To start the app with hot reload, run the following commands:
```bash
docker build -t multi_tenants .
docker compose up -d app-dev
```

You can now make queries to the API at `localhost:3002/graphql`

:warning: 
If it were to appear not working, the simpler solution would be to create a free Mongodb Atlas cluster and update the `MONGO_URI` environment variable in the `docker-compose.yml` file with the connection string provided by MongoDB Atlas cluster.
link: https://www.mongodb.com/cloud/atlas
follow the instructions and in an .env file, add the following line:
```bash
DATABASE_URL="your_mongodb_atlas_connection_string"
```

This will ensure that the application can connect to the database properly.

You then can run the app by doing:
```bash
npm run start:dev
```
It will start the app with hot reload, the API will be available at `localhost:3000/graphql`


### Seeding information
The database is seeded with 1 org, 1 user 1 event and 1 event registration.
Here are the following UUIDs to allow you to use the API directly without having to create the data first:
Organization UUID: `ecdd4d74-cd32-4c78-a5e9-5ee1714f2a55`
User UUID: `85842442-7420-4a80-a609-ce60be135cce`
Event UUID: `a2bfc8a7-1ff6-4cff-bf1a-941237d3e7a0`

### Insomnia collection
You can find an insomnia collection in the `insomnia_call_collection.yaml` file. 
You can import it into Insomnia to test the API endpoints.


### Missing features

- Multiple event occurrences

I would have added an occurrences pattern in the `event` model, similar to how NestJS define occurrences for its cron .
Based on this schema, I would have then registered event to said user based on the pattern.
Questions and potential issues/flaws to this solution are talked in the `ARCHITECTURE.md` file.

- Conflict detection/management

    Based on the occurrences pattern, and the already registered event for said user, 
    Using a unique index `[userId, createdAt]` on the `Registrations` collection, I would have prevented the creation of conflicting registration for a given user.

### Improvements
- GraphQL (*it's been awhile*)

    I'm pretty sure that my schema can be greatly improved, it mostly acts as a REST API.
    I'm not taking full advantage of GraphQL capabilities, especially when it comes to querying for nested data.

- Caching

Due to my lack of use of GraphQL, I haven't implemented any "complex" cache mechanism.
With proper resolvers, sub-resolvers and data-loader, I could have implemented a caching mechanism to reduce the number of queries to the database.
You can still find a (basic) implementation, in the `event.service.ts` file.

Cache invalidation should happen after any mutation (creation/deletion) of events or registrations.
At an org level or user level, depending on the type of mutation.

We could imagine an explicit cache invalidation, requiring developers to call directly the set/delete method.
Another solution could be to trigger an event (either in memory using out-of-the-box feature of NestJS) or using a message broker.
Those events could be `org_events_updated`, `user_registrations_updated` etc... and would be triggered after any mutation on the corresponding data.
Listeners for those events would then act accordingly regarding cache update.


- AGENT.md

I didn't take the time to write an agent nor specific skills for said agent/AI.
On personal experience I feel like i always have to correct the behavior event with skills and agent definition.
My prompting engineering skills could be the issue.

I would also point out this recent article highlighting the limitations of such files: arxiv.org/abs/2602.11988
sometimes even being counter-productive.

I'd be happy to discuss this topic further, specially in a context of a tech interview.
