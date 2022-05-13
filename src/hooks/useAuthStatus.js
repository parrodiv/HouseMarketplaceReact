import {useEffect, useState, useRef} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
//onAuthStateChanged -> anytime the state changes (from logged in to log out) this will fire off


//what is solved through this hook is that even if I am logged in and I reload and I am in the profile section, I will get an error because the component is rendered before the data is obtained from firebase


const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if(user){
          setLoggedIn(true)
        }
        setLoading(false)
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  return {loggedIn, loading}
}

//PROTECTED ROUTE IN V6 WITH FIREBASE
//https://stackoverflow.com/questions/65505665/protected-route-with-firebase

export default useAuthStatus
