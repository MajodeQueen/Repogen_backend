const ReportsTypeDef = `#graphql
type Query {
  productPerformance(startDate: String!, endDate: String!): [ProductPerformance!]!
  salesReport(startDate: String!, endDate: String!): SalesReport!
  expensesReport(startDate: String!, endDate: String!): ExpensesReport!
  debtorsReport(startDate: String!, endDate: String!): DebtorsReport!
  profitLossReport(startDate: String!, endDate: String!): ProfitLossReport!
  stockReport(startDate: String!, endDate: String!): StockReport!
}

type ProductPerformance {
  productName: String!
  quantitySold: Int!
  totalRevenue: Float!
  averagePrice: Float!
}

type SalesReport {
  totalSales: Float!
  numberOfTransactions: Int!
  averageTransactionValue: Float!
  topSellingProducts: [ProductPerformance!]!
}

type ExpensesReport {
  totalExpenses: Float!
  numberOfTransactions: Int!
  averageTransactionValue: Float!
  expensesByCategory: [ExpenseCategory!]!
}

type ExpenseCategory {
  category: String!
  amount: Float!
  percentage: Float!
}

type DebtorsReport {
  totalDebt: Float!
  numberOfDebtors: Int!
  averageDebtPerDebtor: Float!
  topDebtors: [DebtorSummary!]!
}

type DebtorSummary {
  debtorName: String!
  amountOwed: Float!
}

type ProfitLossReport {
  totalRevenue: Float!
  totalExpenses: Float!
  grossProfit: Float!
  netProfit: Float!
  profitMargin: Float!
}

type StockReport {
  totalStockValue: Float!
  numberOfItems: Int!
  lowStockItems: [StockItem!]!
  outOfStockItems: [StockItem!]!
}

type StockItem {
  productName: String!
  quantity: Int!
  value: Float!
}

`
module.exports = ReportsTypeDef 