import {Navigate, Outlet} from 'react-router-dom'
//Outlet allow us to render child routes or child elements such as Children
import useAuthStatus from '../hooks/useAuthStatus'
import Spinner from './Spinner'


const PrivateRoute = () => {
  const {loggedIn, loading} = useAuthStatus()

  if(loading){
    return <Spinner />
  }

  //se sono loggato ritorna il component Profile, vedi App.js r.20-21
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoute

