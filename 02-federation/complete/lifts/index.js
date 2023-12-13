import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { RESTDataSource } from "@apollo/datasource-rest";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Lift @key(fields: "id") {
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
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers
    })
  });

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
