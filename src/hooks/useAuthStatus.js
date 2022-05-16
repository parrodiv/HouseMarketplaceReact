import {useEffect, useState} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
//onAuthStateChanged -> anytime the state changes (from logged in to log out) this will fire off


//what is solved through this hook is that even if I am logged in and I reload and I am in the profile section, I will get an error because the component is rendered before the data is obtained from firebase


const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }
      setLoading(false);
    });
    return unsub
  }, []);

  return {loggedIn, loading}
}

//PROTECTED ROUTE IN V6 WITH FIREBASE
//https://stackoverflow.com/questions/65505665/protected-route-with-firebase

export default useAuthStatus
