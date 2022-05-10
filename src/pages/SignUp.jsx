import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {doc, setDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  //DESTRUCTURE OBJ
  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
      //The square brackets are for dynamically setting a object property using a variable, in this case the target elements id.
    }));
  };

  const onSubmit =  async (e) => {
    e.preventDefault()

    try {
      const auth = getAuth();
      console.log(auth);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);

      const user = userCredential.user;
      console.log(user);

      updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = { ...formData };
      delete formDataCopy.password; //delete password from formDataCopy obj because obviously I don't want it is visible in database
      formDataCopy.timestamp = serverTimestamp();

      // Add a new document in collection "users"
      await setDoc(doc(db, "users", user.uid), formDataCopy);
      //update the database and add our user to the users collection
      //https://firebase.google.com/docs/firestore/manage-data/add-data?hl=it&authuser=0

      navigate('/');

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Sign Up</p>
        </header>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="nameInput"
            placeholder="Name"
            id="name"
            value={name}
            onChange={onChange}
          />

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

          <Link to="/forgot-password" className="forgotPasswordLink">
            Forgot Password
          </Link>

          <div className="signUpBar">
            <p className="signUpText">Sign Up</p>
            <button className="signUpButton">
              <ArrowRightIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>

        {/* Google 0Auth */}

        <Link to="/sign-in" className="registerLink">
          Sign In Instead
        </Link>
      </div>
    </>
  );
}

export default SignUp;
