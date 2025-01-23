const { mergeTypeDefs } = require('@graphql-tools/merge');
const SalesTypeDef = require('./salesTypeDef');
const DebtsTypeDef = require('./debtsTypeDef');
const StockTypeDef = require('./stockTypeDef');
const BusinessTypeDef = require('./businessTypeDef');
const ExpensesTypeDef = require('./expensesTypeDef');
const UserTypeDef = require('./userTypeDef');

const allTypeDefs = mergeTypeDefs([
  SalesTypeDef,
  DebtsTypeDef,
  ExpensesTypeDef,
  UserTypeDef,
  BusinessTypeDef,
  StockTypeDef,
]);

module.exports = allTypeDefs;
