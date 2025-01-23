const StockTypeDef = `#graphql
type StockData {
  _id: ID!
  name: String,
  quantity: Float!
  costPrice: Float
  sellPrice: Float!
  date: String,
}

type StockResponse {
  success: Boolean!
  message: String!
  stock: [StockData]
}

type AddStockResponse {
  success: Boolean!
  message: String!
  stock: StockData
}

type Query {
  allStock: StockResponse!
}

type Mutation {
  addStock(input: StockInput!): AddStockResponse!
}

input StockInput {
  name: String!
  quantity: Float!
  costPrice: Float
  sellPrice: Float!
  date: String!
}
`;

module.exports = StockTypeDef;
