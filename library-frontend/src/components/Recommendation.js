import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'

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
    me {
        favouriteGenre
      }
  }
`

const Recommendation = (props) => {
    const result = useQuery(ALL_BOOKS, {
        pollInterval: 2000
      })

    

    const [books, setBooks] = useState([])
    const [favGenre, setFavGenre] = useState("")

      useEffect(() => {
        if(result.data && result.data.me) {
            setFavGenre(result.data.me.favouriteGenre)
            setBooks(result.data.allBooks.filter(book => book.genres.includes(result.data.me.favouriteGenre)))
        }
      }, [result])
    
    if (!props.show) {
        return null
    }

    return(
        <div>
            <h1>Recommendation</h1>

            <p>Books in your favourite genre <b>{favGenre}</b></p>


      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
    )
}

export default Recommendation