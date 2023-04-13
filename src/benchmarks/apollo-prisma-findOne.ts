import { PrismaClient } from "@prisma/client";
import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String!
    posts(take: Int): [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User
    comments(take: Int): [Comment!]!
  }

  type Comment {
    id: Int!
    text: String!
    post: Post!
  }

  type Query {
    users(take: Int): [User!]!
  }
`;

const client = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const resolvers = {
  Query: {
    users: async (_, { take = 10 }) => {
      return client.user.findMany({
        take,
      });
    },
  },
  User: {
    posts: async (user, { take = 10 }) => {
      return client.user
        .findFirst({
          where: {
            id: user.id,
          },
        })
        .posts({
          take,
        });
    },
  },
  Post: {
    comments: async (post, { take = 10 }) => {
      return client.post
        .findFirst({
          where: {
            id: post.id,
          },
        })
        .comments({ take });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen({
    port: 4001,
  })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
