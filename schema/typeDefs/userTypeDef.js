const UserTypeDef = `#graphql
type User {
  _id: ID!
  username: String!
  email: String!
}

type LoginResponse {
  success: Boolean!
  message: String!
}

type chooseBusinessToAccessResponse {
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
  chooseBusinessToAccess(input:chooseBusinessInput):chooseBusinessToAccessResponse!
}

type Query {
  Me: MeResponse!
}

input SignupInput {
  username: String!
  email: String!
  password: String!
}


input chooseBusinessInput{
  email: String!
  businessId: String!
}

input LoginInput {
  email: String!
  password: String!
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
