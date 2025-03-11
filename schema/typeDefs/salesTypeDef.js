const SalesTypeDef = `#graphql
type SalesData {
  _id: ID!
  customerName: String
  date: String
  quantity: Float
  quantityUnit: String
  productDetails: Stock
  amount: Float
  paymentMode: String
}

type Stock {
  _id: ID!
  name: String
  quantity: Float
  quantityUnit: String
  costPrice: Float
  sellPrice: Float
  date: String
}

type SalesResponse {
  success: Boolean!
  message: String!
  sales: [SalesData]
}

type AddSalesResponse {
  success: Boolean!
  message: String!
  sale: SalesData
}

type GetMonthlySalesStatsResponse{
 success: Boolean!
 message: String!
 year: Float
 month: Float
 totalSales: Float
 totalAmount: Float
 percentageDifference: Float
 percentageDifferenceAmount:Float
}

type MonthlyRevenue {
  month: String!
  totalAmount: Float!
}

type MonthlyRevenueResponse {
  success: Boolean!
  message: String!
  data: [MonthlyRevenue!]!
}


type Query {
  allSales: SalesResponse!
  getMonthlySalesStats(input: SalesstatsInput!):GetMonthlySalesStatsResponse!
  getMonthlyRevenue(year: Int!): MonthlyRevenueResponse!
}

type Mutation {
  addSales(input: SalesInput!): AddSalesResponse!
}

input SalesstatsInput {
 month:Float!
 year:Float!
}

input QuantityInput {
  amount: Float!
  unit: String!
}

input SingleProductInput {
 productId: String!
  quantity: QuantityInput!
  price: Float!
}


input SalesInput {
  customerName: String!
  date: String!
  saleItems:[SingleProductInput]!
  paymentMode: String!
}
`;

module.exports = SalesTypeDef;
