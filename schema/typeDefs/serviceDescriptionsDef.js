const descriptionTypeDef = `#graphql
type descriptionData{
    _id:ID
   name:String
}

type descriptionsResponse {
  success: Boolean!
  message: String!
  descriptions: [descriptionData]
}


type addDescriptionResponse {
  success: Boolean!
  message: String!
  description: descriptionData


}

type Query{
   allDescrptions:descriptionsResponse!
}

type Mutation{
  addDescriptions(input: descriptionsInput!):addDescriptionResponse
}

input descriptionsInput{
  descriptionName:String
}
`;
module.exports = descriptionTypeDef;