const StockTypeDef = `#graphql
type StockData {
  _id: ID!
  name: String,
  quantity: Float
  quantityUnit: String
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

input QuantityInput {
  amount: Float!
  unit: String!
}

input UpdateStockInput {
  stockId: String!
  quantity: QuantityInput!
  costPrice: Float
}



input SingleStockInput {
costPrice:Float
name:String
price:Float
productId:String
quantity:QuantityInput
}

input StockInput {
  stockItems:[SingleStockInput!]
  date: String!
}
`;

module.exports = StockTypeDef;
