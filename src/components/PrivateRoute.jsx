import {Navigate, Outlet} from 'react-router-dom'
//Outlet allow us to render child routes or child elements such as Children
import useAuthStatus from '../hooks/useAuthStatus'

const PrivateRoute = () => {
  const {loggedIn, loading} = useAuthStatus()

  if(loading){
    return <h3>Loading...</h3>
  }

  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoute

