const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
require('dotenv').config();
const Book = require('./models/book')
const Author = require('./models/author');
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const MONGODB_URI = process.env.MONGO_URI
const JWT_SECRET = "sallaisuus"

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
    me: User
  }

  type User {
    username: String!
    id: ID!
  }
  
  type Token {
    value: String!
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

  type Mutation {
    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
    },
     me: (root, args, context) => {
      return context.currentUser
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
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Not authenticated")
      }
      if (args.title.length < 2) {
        throw new UserInputError("title too short", {invalidArgs: args.title})
      }
      if (args.author.length < 3) {
        throw new UserInputError("author name too short", {invalidArgs: args.author})
      }
      let author = await Author.findOne({name: args.author})

      if(!author) {
        author = new Author({name: args.author, born: null})
        await author.save()
      }
      const book = new Book({ ...args })
      book.author = author
      return book.save()
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const currentYear = new Date().getFullYear()
      if (args.born < 0 || args.born > currentYear) {
        throw new UserInputError("Invalid year for author birth", {invalidArgs: args.setBornTo})
      }
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save()
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
}})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

