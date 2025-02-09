const { mergeTypeDefs } = require('@graphql-tools/merge');
const SalesTypeDef = require('./salesTypeDef');
const DebtsTypeDef = require('./debtsTypeDef');
const StockTypeDef = require('./stockTypeDef');
const BusinessTypeDef = require('./businessTypeDef');
const ExpensesTypeDef = require('./expensesTypeDef');
const UserTypeDef = require('./userTypeDef');
const ServiceSalesTypeDef = require('./serviceSalesTypeDef');
const descriptionTypeDef = require('./serviceDescriptionsDef');

const allTypeDefs = mergeTypeDefs([
  SalesTypeDef,
  DebtsTypeDef,
  ExpensesTypeDef,
  UserTypeDef,
  BusinessTypeDef,
  StockTypeDef,
  ServiceSalesTypeDef,
  descriptionTypeDef
]);

module.exports = allTypeDefs;
