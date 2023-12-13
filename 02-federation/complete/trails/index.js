import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";

import trails from "./trail-data.json" assert { type: "json" };

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Trail {
    id: ID!
    name: String!
    status: TrailStatus!
    difficulty: Difficulty!
    groomed: Boolean!
    trees: Boolean!
    night: Boolean!
  }

  enum Difficulty {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum TrailStatus {
    OPEN
    CLOSED
  }

  type Query {
    allTrails(status: TrailStatus): [Trail!]!
    Trail(id: ID!): Trail!
    trailCount(status: TrailStatus): Int!
  }

  type Mutation {
    setTrailStatus(id: ID!, status: TrailStatus!): Trail!
  }
`;

const resolvers = {
  Query: {
    allTrails: (root, { status }) =>
      !status
        ? trails
        : trails.filter((trail) => trail.status === status),
    Trail: (root, { id }) =>
      trails.find((trail) => id === trail.id),
    trailCount: (root, { status }) =>
      !status
        ? trails.length
        : trails.filter((trail) => trail.status === status)
            .length
  }
};

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers })
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 }
  });
  console.log(
    `🏔 Snowtooth - trail Service running at ${url}`
  );
}

startApolloServer();
