const DebtsTypeDef = `#graphql
type Debts {
  _id: ID!
  debtorName: String!
  date: String!
  amount: Float!
  dueDate: String!
  debtStatus: String
}

type DebtsResponse {
  success: Boolean!
  message: String!
  debts: [Debts]
}

type AddDebtResponse {
  success: Boolean!
  message: String!
  debt: Debts
}

type Query {
  allDebts: DebtsResponse!
}

type Mutation {
  addDebts(input: DebtsInput!): AddDebtResponse!
}

input DebtsInput {
  debtorName: String!
  date: String!
  amount: Float!
  dueDate: String!
}
`;

module.exports = DebtsTypeDef;
