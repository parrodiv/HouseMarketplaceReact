import {Navigate, Outlet} from 'react-router-dom'
//Outlet allow us to render child routes or child elements such as Children

const PrivateRoute = () => {
  const loggedIn = false
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoute

