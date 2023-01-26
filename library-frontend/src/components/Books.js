import { useEffect, useState } from 'react'
import { gql, useQuery, useApolloClient } from '@apollo/client'


const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
    genres
  }
`


const Books = (props) => {
  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })

  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("all")

  useEffect(() => {
    if(result.data && result.data.genres) {
      setBooks(result.data.allBooks)
      setGenres(result.data.genres)
    }
  }, [result])


  if (!props.show) {
    return null
  } 

  

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {selectedGenre === "all" ? books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )): books.filter(book => book.genres.includes(selectedGenre)).map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )) }
        </tbody>
      </table>
      <div>

      {genres.map(genre => {
        return <button key={genre} disabled={selectedGenre===genre} onClick={()=> setSelectedGenre(genre)}>{genre}</button>
      })}
      <button disabled={selectedGenre==="all"} onClick={()=> setSelectedGenre("all")}>all genres</button>
      </div>
    </div>
  )
}

export default Books
