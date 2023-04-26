import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "apollo-server";
import { writeFileSync } from "fs";
import { lexicographicSortSchema, printSchema } from "graphql";

const client = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
}>({
  plugins: [PrismaPlugin],
  prisma: { client },
});

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name", { nullable: true }),
    posts: t.relation("posts", {
      args: { take: t.arg.int({ defaultValue: 10 }) },
      query: ({ take }) => ({ take: take || undefined }),
    }),
  }),
});

builder.prismaObject("Post", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    content: t.exposeString("content", { nullable: true }),
    published: t.exposeBoolean("published"),
    author: t.relation("author"),
    comments: t.relation("comments", {
      args: { take: t.arg.int({ defaultValue: 10 }) },
      query: ({ take }) => ({ take: take || undefined }),
    }),
  }),
});

builder.prismaObject("Comment", {
  fields: (t) => ({
    id: t.exposeID("id"),
    text: t.exposeString("text"),
    post: t.relation("post"),
  }),
});

builder.queryType({
  fields: (t) => ({
    users: t.prismaField({
      type: ["User"],
      args: { take: t.arg.int({ defaultValue: 10 }) },
      resolve: (query, _root, { take }) =>
        client.user.findMany({ ...query, take: take || undefined }),
    }),
  }),
});

const schema = builder.toSchema({});

const schemaAsString = printSchema(lexicographicSortSchema(schema));

writeFileSync(
  "src/benchmarks/__generated__/pothos-schema.graphql",
  schemaAsString
);

const server = new ApolloServer({ schema });

server
  .listen({
    port: 4001,
  })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
