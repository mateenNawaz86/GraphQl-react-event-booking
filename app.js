const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();
app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }


    type RootQuery {
        events: [Event!]!
    }
    type RootMutation {
        createEvent(title:String!, description: String!, price:Float!, date: String!): Event 
    }
    schema {
      query:RootQuery,
      mutation:RootMutation
      
    }
    `),
    rootValue: {
      events: () => {
        return ["Event 1", "Event 2", "Event 3"];
      },
      createEvent: (args) => {
        const eventName = args.name;
        return eventName;
      },
    },

    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
