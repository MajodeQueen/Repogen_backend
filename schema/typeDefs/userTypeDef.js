const UserTypeDef = `#graphql
type User {
  _id: ID!
  username: String!
  email: String!
}

type LoginResponse {
  success: Boolean!
  message: String!
  user: User
  businessId: String
  isAdmin:Boolean
}

type MeResponse {
  success: Boolean!
  message: String!
  user: User
}

type Mutation {
  signup(input: SignupInput!): SignupResponse!
  login(input: LoginInput!): LoginResponse!
  logout: LogoutResponse!
}

type Query {
  Me: MeResponse!
}

input SignupInput {
  username: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
  businessId: String!
}

type SignupResponse {
  success: Boolean!
  message: String!
  user: User
}

type LogoutResponse {
  success: Boolean!
  message: String!
}
`;

module.exports = UserTypeDef;
