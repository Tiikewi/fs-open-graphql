import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import Login from './components/Login'
import Recommendation from './components/Recommendation'

const ALL_AUTHORS_BOOKS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    },
  }
`


const App = () => {
  const client = useApolloClient()

  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const result = useQuery(ALL_AUTHORS_BOOKS, {
    pollInterval: 2000
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommendation')}>recommend</button>
        {token ? <button onClick={() => setPage('add')}>add book</button> : null}
        {!token ? <button onClick={() => setPage('login')}>login</button> : <button onClick={logout}>logout</button>}
        
      </div>

      <Authors show={page === 'authors'} authors={result.data.allAuthors} />

      <Books show={page === 'books'} books={result.data.allBooks} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} setToken={setToken} />

      <Recommendation show={page === 'recommendation'} setToken={setToken} />
    </div>
  )
}

export default App
