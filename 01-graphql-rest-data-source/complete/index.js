import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import gql from "graphql-tag";
import { RESTDataSource } from "@apollo/datasource-rest";

import trails from "./data/trails.json" assert { type: "json" };

class LiftAPI extends RESTDataSource {
  baseURL = "https://snowtooth-api-rest.fly.dev";

  async getLifts() {
    let data = await this.get();
    return JSON.parse(data);
  }
}

const typeDefs = gql`
  type Lift {
    id: ID!
    name: String!
    status: LiftStatus
    capacity: Int!
    night: Boolean!
    elevationGain: Int!
  }

  enum LiftStatus {
    OPEN
    CLOSED
    HOLD
  }

  type Trail {
    id: ID
    name: String!
    status: TrailStatus
    difficulty: String!
    groomed: Boolean!
    trees: Boolean!
    night: Boolean!
  }

  enum TrailStatus {
    OPEN
    CLOSED
  }

  type Query {
    allTrails(status: TrailStatus): [Trail!]!
    findTrailByName(name: String!): Trail!
    trailCount(status: TrailStatus!): Int!
    allLifts(status: LiftStatus): [Lift!]!
  }
`;
const resolvers = {
  Query: {
    allLifts: (_, {}, { dataSources }) => {
      return dataSources.liftsAPI.getLifts();
    },
    allTrails: (parent, { status }) =>
      !status
        ? trails
        : trails.filter((trail) => trail.status === status),
    findTrailByName: (parent, { name }) =>
      trails.find((trail) => name === trail.name),
    trailCount: (parent, { status }) =>
      !status
        ? trails.length
        : trails.filter((trail) => trail.status === status)
            .length
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
    listen: { port: 4000 }
  });

  console.log(`🚠 Snowtooth Server Running at ${url}`);
}

startApolloServer();
