import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const initialFormState = {
  type: 'rent',
  name: '',
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  address: '',
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  images: {},
  latitude: 0,
  longitude: 0,
};

function CreateListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...initialFormState, userRef: user.uid });
      } else {
        navigate('/sign-in');
      }
    });
    return unsubscribe;
  }, [auth, navigate]);

  // https://www.udemy.com/course/react-front-to-back-2022/learn/lecture/29769164#questions/16680132
  //The linter warns us that we have a missing dependency of formData because we are using it in useEffect, React knows it may change but we are using it in useEffect so useEffect needs to know if it changed. But if we include it as a dependency then useEffect will run whenever we update it and you will get infinite renders because we are calling setFormData in useEffect.

  //SE AVESSIMO INSERITO ...formData invece che ...intialFormState avremmo ricevuto un warning che consiglia di inserire il formData come dipendenza, il che genererebbe un loop infinito andando a risettare continuamente il formData state con setFormData

  //With declaring initalFormState outside of the component this guarantees it never changes, it's the same object in memory every time. So you won't get any linter warnings for it.

  return loading ? <Spinner /> : <div>Create Listing</div>;
}

export default CreateListing;
