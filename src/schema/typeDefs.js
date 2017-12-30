module.exports = `
scalar Date

type User {
    id: ID!
    login: String!
    homeFloor: Int
    avatarUrl: String!
}

type UserRoom {
    id: ID!
    title: String!
}

input CreateUserInput {
    login: String!
    homeFloor: Int
}

input UpdateUserInput {
    id: ID!
    login: String
    homeFloor: Int
    avatarUrl: String
}

input RemoveUserInput {
    id: ID!
}

type Room {
    id: ID!
    title: String!
    capacity: Int!
    floor: Int!
}

input CreateRoomInput {
    title: String!
    capacity: Int!
    floor: Int!
}

input UpdateRoomInput {
    id: ID!
    title: String
    capacity: Int
    floor: Int
}

input RemoveRoomInput {
    id: ID!
}

type Event {
    id: ID!
    title: String!
    dateStart: Date!
    dateEnd: Date!
    users: [User]
    room: Room
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

type Query {
  user(id: ID!): User
  users: [User]
  event(id: ID!): Event
  events: [Event]
  room(id: ID!): Room
  rooms: [Room]
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
  addUserToEvent(id: ID!, userId: ID!): Event
  changeEventRoom(id: ID!, roomId: ID!): Event
  removeEvent(id: ID!): Event
}

union SearchResult = User | Event | Room

schema {
  query: Query
  mutation: Mutation
}
`
