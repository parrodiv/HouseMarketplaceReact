import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import { ReactComponent as ArroWRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import {toast} from 'react-toastify'
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  //DESTRUCTURE OBJ
  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
      //The square brackets are for dynamically setting a object property using a variable, in this case the target elements id.

      //la funzione viene resa "universale", quindi anche se ci fossero più input, l'importante sarebbe avere l'id dell'input uguale alla proprietà dell'oggetto.
      //Se la funzione non fosse strutturato in questo modo, avrei dovuto creare una funzione per ogni input
      //ES: onChangeEmail ed onChangePassword
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      const user = userCredential.user
      if(user){
        navigate('/profile')
      }
      console.log(user);

    } catch (error) { 
      toast.error('Bad User Credentials', {
        autoClose: '3000',
        position: "top-center" 
      })

      
    }
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>

        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="emailInput"
            placeholder="Email"
            id="email"
            value={email}
            onChange={onChange}
          />

          <div className="passwordInputDiv">
            {/* pos: relative per img visibilityIcon */}
            <input
              type={showPassword ? 'text' : 'password'}
              className="passwordInput"
              placeholder="Password"
              id="password"
              value={password}
              onChange={onChange}
            />

            <img
              src={visibilityIcon}
              alt="showPassword"
              className="showPassword"
              onClick={() => setShowPassword((prevState) => !prevState)}
              //opposite of prevState (from true to false and viceversa)
            />
          </div>

          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>

          <div className="signInBar">
            <p className="signInText">
              Sign In
            </p>
            <button className="signInButton">
              <ArroWRightIcon fill='#fff' width='34px' height='34px' />
            </button>
          </div>
        </form>

        {/* Google 0Auth */}

        <Link to='/sign-up' className='registerLink'>
          Sign Up Instead
        </Link>
      </div>
    </>
  );
}

export default SignIn;
