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

type UpdateDebtPaymentResponse {
  success: Boolean!
  message: String!
  debt: Debts  
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
  updateDebtPayment(input: UpdateDebtPaymentInput!): UpdateDebtPaymentResponse!
}

input UpdateDebtPaymentInput {
  debtId: String!           
  amountPaid: Float!
}

input DebtsInput {
  debtorName: String!
  date: String!
  amount: Float!
  dueDate: String!
}
`;

module.exports = DebtsTypeDef;
