const ExpensesTypeDef = `#graphql
type Expenses {
  _id: ID!
  expenseName: String!
  date: String!
  amount: Float!
  category: String!
}

type ExpensesResponse {
  success: Boolean!
  message: String!
  expenses: [Expenses]
}

type AddExpenseResponse {
  success: Boolean!
  message: String!
  expense: Expenses
}

type Query {
  allExpenses: ExpensesResponse!
}

type Mutation {
  addExpenses(input: ExpensesInput!): AddExpenseResponse!
}

input ExpensesInput {
  expenseName: String!
  date: String!
  amount: Float!
  category: String!
}
`;

module.exports = ExpensesTypeDef;
