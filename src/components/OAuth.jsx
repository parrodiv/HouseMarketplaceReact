import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

function OAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  // console.log(location); {patname:'/sign-up', hash: "", search:""....}

  const onGoogleClick = async () => {
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      // If you want to be able to sign in/up with a different Google Account
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log(result);

      // Check for user
      const docRef = doc(db, 'users', user.uid)
      // get the user from signInWithPopup and we are checking if the user ID have a reference to that document
      const docSnap = await getDoc(docRef)
      console.log(docSnap);

      // If user doesn't exist, create user on firestore
      if(!docSnap.exists()){
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp()
        });
      }
      navigate('/')

    } catch (error) {
      toast.error('Could not authorize with Google')
      console.log(error);
    }
  }

  return (
    <div className='socialLogin'>
      <p>Sign {location.pathname === '/sign-up' ? 'up' : 'in'}</p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img src={googleIcon} alt="googleIcon" className="socialIconImg" />
      </button>
    </div>
  )
}

export default OAuth
