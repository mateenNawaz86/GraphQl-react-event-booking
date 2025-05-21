const express = require("express");
const bodyParser = require("body-parser");
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");
const bcrypt = require("bcryptjs");

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

       input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password:String
      }

      input UserInput {
        email:String!
        password:String
      }

    type RootQuery {
        events: [Event!]!
        users:[User!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event 
        createUser(userInput: UserInput): User
    }

    schema {
      query:RootQuery,
      mutation:RootMutation
    }
    `),

    rootValue: {
      events: () => {
        Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event.id.toString() };
            });
          })
          .catch((err) => {
            console.log("Error fetching events", err);
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creators: "6824885ef8e34baeb77a6a54",
        });

        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById("6824885ef8e34baeb77a6a54");
            // return { ...result._doc, _id: result._doc._id.toString() };
          })
          .then((user) => {
            if (!user) {
              throw new Error("User Not Found.");
            }

            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log("Error saving event", err);
            throw err;
          });
      },

      createUser: (args) => {
        // check that if user with this already email already exist
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User with this email already exist.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });

            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },

    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@crud.pk39a.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
