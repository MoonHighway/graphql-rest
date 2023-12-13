import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { RESTDataSource } from "@apollo/datasource-rest";
import lifts from "./lift-data.json" assert { type: "json" };

const typeDefs = gql`
  type Lift {
    id: ID!
    name: String!
    status: LiftStatus!
    capacity: Int!
    night: Boolean!
    elevationGain: Int!
  }

  enum LiftStatus {
    OPEN
    HOLD
    CLOSED
  }

  type Query {
    allLifts(status: LiftStatus): [Lift!]!
  }
`;

class LiftAPI extends RESTDataSource {
  baseURL = "https://snowtooth-api-rest.fly.dev";

  async getLifts() {
    let data = await this.get();
    return JSON.parse(data);
  }
}

const resolvers = {
  Query: {
    allLifts: (_, {}, { dataSources }) => {
      return dataSources.liftsAPI.getLifts();
    }
  }
};

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          liftsAPI: new LiftAPI({ cache })
        }
      };
    },
    listen: { port: 4001 }
  });

  console.log(`🚠 Snowtooth Server Running at ${url}`);
}

startApolloServer();
