import { useState, useEffect } from "react"
import { gql, useMutation, setError } from '@apollo/client'


const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
const Login = ({setToken, show}) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    
    
    const [ login, result ] = useMutation(LOGIN, {variables: {username, password}})
    useEffect(() => {
        if ( result.data ) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('book-app-token', token)
            setUsername("")
            setPassword("")
        }
    }, [result.data, setToken])
    
    if(!show) return null

    return(
    <div>
        <label>
            username: 
        </label>
        <input type={"text"} value={username} onChange={(e) => setUsername(e.target.value)}></input>
        <label>
            password: 
        </label>
        <input type={"password"} value={password} onChange={(e) => setPassword(e.target.value)}></input>
        <button onClick={login}>Login</button>
    </div>
    )

}

export default Login