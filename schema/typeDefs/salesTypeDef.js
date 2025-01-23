const SalesTypeDef = `#graphql
type SalesData {
  _id: ID!
  customerName: String!
  date: String!
  quantity: Float!
  productDetails: Stock!
  amount: Float!
  paymentMode: String!
}

type Stock {
  _id: ID!
  name: String,
  quantity: Float!
  costPrice: Float
  sellPrice: Float!
  date: String,
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

type Query {
  allSales: SalesResponse!
}

type Mutation {
  addSales(input: SalesInput!): AddSalesResponse!
}

input SalesInput {
  customerName: String!
  date: String!
  quantity: Float!
  productDetails: String!
  amount: Float!
  paymentMode: String!
}
`;

module.exports = SalesTypeDef;
