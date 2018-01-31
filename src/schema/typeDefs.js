module.exports = `
scalar Date

type User {
    id: ID!
    firstName: String!
    secondName: String!
    login: String!
    floor: Floor!
    avatarUrl: String!
}

type UserRoom {
    id: ID!
    title: String!
}

input CreateUserInput {
    login: String!
    avatarUrl: String!
    floor: ID!
}

input UpdateUserInput {
    id: ID!
    login: String
    floor: ID
    avatarUrl: String
}

input RemoveUserInput {
    id: ID!
}

type Room {
    id: ID!
    title: String!
    capacity: Int!
    events(filter: EventsFilter, sort: Sort): [Event!]
    floor: Floor!
}

input CreateRoomInput {
    title: String!
    capacity: Int!
    floor: ID!
}

input UpdateRoomInput {
    id: ID!
    title: String
    capacity: Int
    floor: ID
}

input RemoveRoomInput {
    id: ID!
}

type Event {
    id: ID!
    title: String!
    dateStart: Date!
    dateEnd: Date!
    users: [User!]
    room: Room!
}

input EventsFilter {
    onDate: Date
}

input CreateEventInput {
    title: String!
    dateStart: Date!
    dateEnd: Date!
    roomId: ID!
    userIds: [ID!]
}

input UpdateEventInput {
    id: ID!
    title: String
    dateStart: Date
    dateEnd: Date
}

input RemoveUserFromEventInput {
    eventId: ID!
    userId: ID!
}

input ChangeEventRoomInput {
    roomId: ID!
    eventId: ID!
}

input Sort {
    field: String!
    order: SortTypes
}

type Floor {
    id: ID!
    floor: Int!
    rooms: [Room!]
}

enum SortTypes {
  ASC
  DESC
}



type Query {
  user(id: ID!): User
  users(filter: String): [User!]
  event(id: ID!): Event
  events(filter: EventsFilter, sort: Sort): [Event!]
  room(id: ID!): Room
  rooms: [Room!]
  floors(order: SortTypes): [Floor]
}

input AddUserToEventInput {
    userId: ID!
    eventId: ID!
}

input RemoveEventInput {
    id: ID!
}

type Mutation {
  createUser(input: CreateUserInput!): User
  updateUser(input: UpdateUserInput!): User
  removeUser(input: RemoveUserInput!): User

  createRoom(input: CreateRoomInput!): Room
  updateRoom(input: UpdateRoomInput!): Room
  removeRoom(input: RemoveRoomInput!): Room

  createEvent(input: CreateEventInput!): Event
  updateEvent(input: UpdateEventInput!): Event
  removeUserFromEvent(input: RemoveUserFromEventInput!): Event
  addUserToEvent(input: AddUserToEventInput!): Event
  changeEventRoom(input: ChangeEventRoomInput!): Event
  removeEvent(input: RemoveEventInput): Event
}

schema {
  query: Query
  mutation: Mutation
}
`
