const RecentTransactionTypeDef = `#graphql

type DeleteEntryResponse{
success: Boolean!
message: String!
}

union Entry = SalesData | Expenses | ServicesSalesData | StockData | Debts

type RecentEntriesResponse {
  date: String
  entries: [Entry]!
}

type Mutation {
  deleteEntry(input:DeleteEntryInput !):DeleteEntryResponse!
}

type Query {
  recentEntries(type: String!): RecentEntriesResponse!
}


input DeleteEntryInput {
type:String!
transactionID:String!
}


`
module.exports = RecentTransactionTypeDef;