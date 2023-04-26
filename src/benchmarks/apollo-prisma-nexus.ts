import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "apollo-server";
import { makeSchema, objectType, queryType } from "nexus";
import { nexusSchemaPrisma } from "nexus-plugin-prisma/schema.js";
import { join } from "path";
import "./__generated__/nexus-typegen";

const client = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const User = objectType({
  name: "User",
  definition: (t) => {
    t.model.id();
    t.model.email();
    t.model.name();
    t.model.posts();
  },
});

const Post = objectType({
  name: "Post",
  definition: (t) => {
    t.model.id();
    t.model.title();
    t.model.content();
    t.model.published();
    t.model.author();
    t.model.comments();
  },
});

const Comment = objectType({
  name: "Comment",
  definition: (t) => {
    t.model.id();
    t.model.text();
    t.model.post();
  },
});

const Query = queryType({
  definition: (t) => {
    t.crud.users();
  },
});

const schema = makeSchema({
  types: { Query, User, Post, Comment },
  plugins: [
    nexusSchemaPrisma({
      experimentalCRUD: true,
      outputs: {
        typegen: join(
          __dirname,
          "__generated__",
          "typegen-nexus-plugin-prisma.d.ts"
        ),
      },
    }),
  ],
  outputs: {
    typegen: join(__dirname, "__generated__", "nexus-typegen.ts"),
    schema: join(__dirname, "__generated__", "nexus-schema.graphql"),
  },
});

const server = new ApolloServer({ schema, context: { prisma: client } });

server
  .listen({
    port: 4001,
  })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
