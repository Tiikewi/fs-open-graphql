import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Select from 'react-select';


const UPDATE_AGE = gql`
  mutation UpdateAge($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name,
      born
    }
  }
`



const Authors = (props) => {
 
  const authors = props.authors || []

  const [age, setAge] = useState('')

  const [ updateAge ] = useMutation(UPDATE_AGE)

  const [selectedOption, setSelectedOption] = useState(null)


  const options = authors.map(author => ({...author, value: author.name, label: author.name}))


  const submit = async (event) => {
    event.preventDefault()

    updateAge({variables: {name: selectedOption.name, setBornTo: parseInt(age)}})

    setAge('')
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <form onSubmit={submit}>
        <div>
        <Select
        defaultValue={selectedOption}
        onChange={setSelectedOption}
        options={options}
      />
          <br />
          Born
          <input
            value={age}
            type="number"
            onChange={({ target }) => setAge(target.value)}
          />
        </div>
 
        <button type="submit">update age</button>
      </form>
    </div>
  )
}

export default Authors
