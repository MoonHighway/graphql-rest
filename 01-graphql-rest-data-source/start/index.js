const { ApolloServer } = require("@apollo/server");
const {
  startStandaloneServer
} = require("@apollo/server/standalone");
const { gql } = require("graphql-tag");

const trails = require("./data/trails.json");

const typeDefs = gql`
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
  }
`;
const resolvers = {
  Query: {
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
    listen: { port: 4000 }
  });

  console.log(`🚠 Snowtooth Server Running at ${url}`);
}

startApolloServer();
