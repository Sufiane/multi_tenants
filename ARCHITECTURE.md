# Architecture

## Overview
Basic architecture of the app is a monolith, with a GraphQL API, and a MongoDB database.
Chose Prisma as ORM, as I'm more familiar with it and didn't see/remember the mongoose conditions. 
It's also a modern ORM, with a good documentation and a good community support, which is always a plus when you want to implement something quickly.

The API, basically consist of 4 main types: Organization, User, Event and EventRegistration.
The folder structure is based on what we call a domain (basically the object types), with a folder for each type
Each domain folder contains:
    resolver files: for the GraphQL resolvers (kinda similar to controllers in a REST API)
    service files: for the business logic
    db service file: for the data access layer
    dto folder: regrouping all input type and couples as validation schema (out of the box with nest & class validator/transformer)
    object-type folder: regrouping said object types, if multiple were to be manager in the same domain (we could have a `EventCapacity` object type for instance, if we wanted to separate the capacity management from the event management)
If it was needed, a common folder could be created for shared utils/services (like a service with the same utility as a caching service)

The overall architecture (DB, API) was already selected as project requirements.

## Multi tenancy strategy

Possible solutions
- Different schemas for each tenant
- One DB for all, discrimination by tenantId (here organizationId)
- One DB per tenant

### Different schemas for each tenant
- Pros:
  - Data isolation: Each tenant's data is stored in a separate schema, providing better data isolation and security.
  - Customization: Allows for tenant-specific customizations in the database schema.
- Cons:
  - scalability: Managing a large number of schemas can become complex and may require additional resources.
  - Maintenance: Schema changes (if we want the same schema for all tenants) need to be applied to all schemas, which can be time-consuming and error-prone.
  - Schema management: Need a robust schema management & schema connection

### One DB for all, discrimination by tenantId (here organizationId)
- Pros:
  - Simplicity: Easier to manage a single database with tenant discrimination, as all tenants share the same schema.
  - Scalability: Can handle a large number of tenants without the overhead of managing multiple schemas.
- Cons:
  - Data isolation: Less isolation between tenants, as all data is stored in the same database
  - Performance: As the number of tenants grows, performance may degrade due to increased contention for database resources.

### One DB per tenant
- Pros:
  - Data isolation: Each tenant has its own database, providing strong data isolation and security.
  - Customization: Allows for tenant-specific customizations in the database schema and configuration.
- Cons:
  - Scalability: Managing a large number of databases can become complex and may require additional resources.
  - Maintenance: Database changes (if same schema for each tenant) need to be applied to all databases
  - Maintenance: if different schemas, code management becomes more complex as we need to maintain different versions of the code for each tenant.
  - Connection: Managing connections to multiple databases can be more complex and may require additional configuration and resources.

### My selection
For simplicity’s sake I chose option 2: One DB for all, with a discriminant. 


## Recurring events storage
I didn't have time to implement this.
I would have added a new `event registration` row for each recurring event happening after the creation date for the given events. 
Example: 
    Event is recurring on a weekly basis (every Wednesday for instance)
    User register on Thursday, I would add a new row for the next Wednesday, and then every week I would add a new row for the next week.

One issue about this solution; when does it end ?
When an event is recurring, it states in the specs that a registration is for one occurrence,
does that mean user need to specify all the occurrences that they want to register for ? 
Or do we assume that if an event is recurring, the user is registering for all the occurrences ?
My solution matches the first assumption.

For the second assumption, we could imagine that once an event has been handled, is the registration was for all occurrences, we create new registration for the next occurrence.

## Conflict detection
`A user cannot register for time-overlapping events.`
Does it mean that a user can only register for one recurring event at a time ?
Or does it meant that a user can only have one event per day ?

Either way, date calculation is needed on the app layer (service) 
and a unique index needs to be created with the association of userId, date in the `event-registration` table/schema.

I'm not sure which assumption is the correct one to be honest, as i'm not sure to understand the implication of having overlapping events.

## Capacity enforcement
My first intention was to calculate the remaining capacity of an event each time a user would register to said event.
Both in the app layer (service), and db layer with a count of `event-registration`.
Due to how mongoDB works, it was not the best solution, as it could allow race conditions.

I decided on a second solution, which is to add a `remainingCapacity` field to the event schema, and decrement it each time a user register for an event.
It also allows for a client, to easily check/disply if an event allow more registration or not.


## trade-offs
Main limitation is based on my multi-tenancy strategy. 
A different strategy based on the real usage of the app could favor either one DB per tenant for a full data isolation.

I didn't create interfaces to follow a strict hexagonal architecture.
Yes the service rely on a dbService directly, I could have created the needed interfaces different repository for each needs.

I also took the decision to use NestJS out-of-the-box error exception to handle http responses, my main reason for this is that way I do not have to worry about exposing internal errors.
NestJS already handle the status code.
For a more hexagonal architecture, i would have had more custom error code, that would be matched in the output layer (resolvers)
returning the according response to the client.

I would have also created use cases/domain interfaces for the output layer (resolvers) to rely on, instead of relying on the service directly.
Object-type would have to be mapped to the service/domain entity to avoid coupling the output layer to the service/domain layer.

All of those choices were made due to the simplicity of the project, the out-of-the-box usage of NestJS modules (which kinda force this kind of architectural separation by default).

# Question for the reviewers
Why GraphQL ?
it does not seem to add any particular value to this project.
Are the clients different (mobile and web) and require different data based on the UI/UX ?

Why mongoDB ?
At first glance this project screams relational, associations between organizations, users, events and registration.
Is it due to traffic ? is it a good trade-off between data integrity and performance ?
