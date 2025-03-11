const quantityUnitsTypeDef = `#graphql
type unitData{
    _id:ID
   name:String
}

type  UnitResponse {
  success: Boolean!
  message: String!
  units: [unitData]
}


type addUnitsResponse {
  success: Boolean!
  message: String!
  units: unitData
}

type Query{
  allUnits:UnitResponse!
}

type Mutation{
  addUnit(input:UnitInput!):addUnitsResponse
}

input  UnitInput{
  unitName:String
}
`
module.exports = quantityUnitsTypeDef