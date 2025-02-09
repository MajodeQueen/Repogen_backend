const ServiceSalesTypeDef = `#graphql
type ServicesSalesData {
  _id: ID!
  serviceName: String
  date: String
  quantity: Float
  amount: Float
  paymentMode: String
}

type ServicesSalesResponse {
  success: Boolean!
  message: String!
  serviceSales: [ServicesSalesData]
}

type AddServicesSalesResponse {
  success: Boolean!
  message: String!
  serviceSale: ServicesSalesData
}


type DailySales {
  date: String!       
  totalAmount: Float!  
}


type MonthlyServiceSalesPerDayResponse {
  success: Boolean!
  message: String!
  year: Int
  month: Int
  salesPerDay: [DailySales] 
}

type GetMonthlyServicesSalesStatsResponse{
 success: Boolean!
 message: String!
 year: Float
 month: Float
 totalSales: Float
 totalAmount: Float
 percentageDifference: Float
 percentageDifferenceAmount:Float
 activeServices:Float
}

type MonthlyServicesRevenue {
  month: String!
  totalAmount: Float!
}

type MonthlyServicesRevenueResponse {
  success: Boolean!
  message: String!
  data: [MonthlyServicesRevenue!]!
}

type singlePerfomance {
  name:String!
  count:Float!
  totalAmountMade:Float!
}

type getProductPerformanceBasedOnNoOfSalesResponse {
  success: Boolean!
  message: String!
  servicePerformanceAccordingToSales: [singlePerfomance!]!
}

type  getWeeklyDataServiceSalesResponse {
success: Boolean!
message: String!
}


type WeeklyData {
  weekOfMonth: Float!
  totalAmount: Float!
  count: Int!
  items: [ServicesSalesData!]!
}

type WeeklySalesResponse {
  success: Boolean!
  message: String!
  data: [WeeklyData!]
}



type Query {
  allServiceSales: ServicesSalesResponse!
  getMonthlyServiceSalesStats(input: ServiceSalesStatsInput!):GetMonthlyServicesSalesStatsResponse!
  getMonthlyServiceRevenue(year: Int!): MonthlyServicesRevenueResponse!
  getProductPerformanceBasedOnNoOfSales(input:ServiceSalesStatsInput):getProductPerformanceBasedOnNoOfSalesResponse!
  getMonthlyServiceSalesPerDay(input: MonthlyServiceSalesPerDayInput!): MonthlyServiceSalesPerDayResponse!
  getWeeklyDataServiceSales(input: WeeklyDataInput!):WeeklySalesResponse!
}

type Mutation {
  addServiceSales(input: ServicesSalesInput!): AddServicesSalesResponse!
}

input MonthlyServiceSalesPerDayInput {
  year: Int!
  month: Int!
}

input ServiceSalesStatsInput {
 month:Float!
 year:Float!
}

input SingleServiceInput {
  quantity: Float!
  serviceName: String!
  salePrice: Float!
  paymentMode:String!
}

input ServicesSalesInput {
  date: String!
  saleEntries:[SingleServiceInput]!
}

input WeeklyDataInput {
  year: Int!
  month: Int!
}
`;

module.exports = ServiceSalesTypeDef;
