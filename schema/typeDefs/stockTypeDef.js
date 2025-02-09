const StockTypeDef = `#graphql
type StockData {
  _id: ID!
  name: String,
  quantity: Float
  costPrice: Float
  sellPrice: Float
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
  updateStock(input:UpdateStockInput!):AddStockResponse!
}

input UpdateStockInput {
  stockId: String!
  quantity: Float
  costPrice: Float
}

input SingleStockInput {
costPrice:Float
name:String
price:Float
productId:String
quantity:Float
}

input StockInput {
  stockItems:[SingleStockInput!]
  date: String!
}
`;

module.exports = StockTypeDef;
