const BusinessTypeDef = `#graphql
type Business {
  _id: ID!
  name: String!
  location: String!
  aspects: [String]!
  admins: [User]!
}

type User {
  _id: ID!
  username: String!
  email: String!
}



type GetBusinessInfoResponse {
  success: Boolean!
  message: String!
  business: Business
}

type CreateBusinessResponse {
  success: Boolean!
  message: String!
  business: Business
}

type BusinessAccessResponse {
 success: Boolean!
 message: String!
 businesses:[Business!]
}

type addEditorResponse{
success: Boolean!
 message: String!
}

type Query {
  getLoggedInBusinessInfo: GetBusinessInfoResponse!
  getAllBusinessesAssociatedWithUser(input:businessAccessInput!):BusinessAccessResponse!
}

type Mutation {
  createBusinessAccount(input: CreateBusinessInput!): CreateBusinessResponse!
  addBusinessEditor(input:addEditorInput!):addEditorResponse!
}


input addEditorInput{
  email:String!
}


input businessAccessInput{
  email:String!
}

input CreateBusinessInput {
  name: String!
  location: String!
  aspects: [String]!
  email: String!
}

`;

module.exports = BusinessTypeDef;
