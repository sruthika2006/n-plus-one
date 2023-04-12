import { gql, ApolloServer } from 'apollo-server'
import { PrismaClient } from '@prisma/client'

const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User
    comments: [Comment!]!
  }

  type Comment {
    id: Int!
    text: String!
    post: Post!
  }

  type Query {
    users(take: Int): [User!]!
  }
`

const client = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const resolvers = {
  Query: {
    users: async (_, { take = 10 }) => {
      return client.user.findMany({
        take,
      })
    },
  },
  User: {
    posts: async (user) => {
      return client.user.findUnique({
        where: {
          id: user.id,
        },
      }).posts()
    },
  },
  Post: {
    comments: async (post) => {
      return client.post.findUnique({
        where: {
          id: post.id,
        },
      }).comments()
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server
  .listen({
    port: 4001,
  })
  .then(({ url }) => {
    // console.log(`🚀 Server ready at ${url}`)
  })
