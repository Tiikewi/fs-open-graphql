const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
require('dotenv').config();
const Book = require('./models/book')
const Author = require('./models/author');

const MONGODB_URI = process.env.MONGO_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
  }
  
  type Mutation {
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }

`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount : async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      return Book.find({})
    },
    allAuthors: async (root) => {
      return Author.find({})
    }
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)
      const bookCount = (await Book.find({author: {$in: [root.author]}})).length
      return {
        name: author.name,
        born: author.born,
        bookCount: bookCount
      }
    }
  },

  Author: {
    bookCount: async (root) => (await Book.find({author: {$in: [root._id]}})).length
  },

  

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({name: args.author})
      console.log('author', author)
      if(!author) {
        author = new Author({name: args.author, born: null})
        await author.save()
      }
      const book = new Book({ ...args })
      book.author = author
      return book.save()
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save()
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

