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
  token:String
}

type MeResponse {
  success: Boolean!
  message: String!
  user: User
  adminAccess:Boolean
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
