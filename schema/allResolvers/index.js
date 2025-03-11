const { mergeResolvers } = require('@graphql-tools/merge');
const BusinessResolver = require('./businessResolver');
const DebtsResolver = require('./debtsResolver');
const ExpensesResolver = require('./expensesResolver');
const SalesResolver = require('./salesResolver');
const UserResolver = require('./userResolver');
const ServicesSalesResolver = require('./serviceSalesResolver');
const descriptionResolver = require('./servicesDescriptionsResolver');
const StockResolver = require('./theStockResolver');
const RecentTransactionsResolver = require('./recentTransactionsResolver');
const ReportsResolver = require('./reportsResolver');


const types = [
  BusinessResolver,
  DebtsResolver,
  ExpensesResolver,
  SalesResolver,
  UserResolver,
  StockResolver,
  ServicesSalesResolver,
  descriptionResolver,
  RecentTransactionsResolver,
  ReportsResolver
];

const allResolvers = mergeResolvers(types);

module.exports = allResolvers;
