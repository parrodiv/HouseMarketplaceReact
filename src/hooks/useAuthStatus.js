import {useEffect, useState} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
//onAuthStateChanged -> anytime the state changes (from logged in to log out) this will fire off

const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if(user){
        setLoggedIn(true)
      }
      setLoading(false)
    })
  })

  return {loggedIn, loading}
}

//PROTECTED ROUTE WITH FIREBASE
//https://stackoverflow.com/questions/65505665/protected-route-with-firebase

export default useAuthStatus
