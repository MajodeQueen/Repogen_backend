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

type MonthlyExpenses {
  month: String!
  totalAmount: Float!
}

type MonthlyExpensesResponse {
  success: Boolean!
  message: String!
  data: [MonthlyExpenses]!
}

type Query {
  allExpenses: ExpensesResponse!
  getMonthlyExpenses(year: Int!): MonthlyExpensesResponse!
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
