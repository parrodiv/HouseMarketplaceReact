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

  //DESTRUCTURE
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

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

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const onMutate = (e) => {
    let boolean = null

    if(e.target.value === 'true') {
    boolean = true
    }

    if(e.target.value === 'false') {
    boolean = false
    }

    //Files
    if(e.target.files){
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files //arr of images
      }))
    }
    // console.log(e.target.files);
    // se il click avviene nel input:file dopo aver selezionato l'img o imgs in console appare un array con le immagini


    //Text / Booleans / Numbers
    if(!e.target.files){
      setFormData((prevState) => ({
        ...prevState,
        // se boolean è null restituisci e.target.value (for text field)
        // se boolean è true o false allora non viene considerato il e.target.value
        [e.target.id]: boolean ?? e.target.value
      }))
      console.log(boolean); 
    }
    // console.log(e.target.value);
  };


  return loading ? (
    <Spinner />
  ) : (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            type="text"
            className="formInputName"
            id="name"
            value={name}
            onChange={onMutate}
            minLength="10"
            maxLength="32"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id="parking"
              value={true}
              min="1"
              max="50"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="parking"
              value={false}
              min="1"
              max="50"
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            type="text"
            className="formInputAddress"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              className="formInputSmall"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="75000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Offer Price</label>
              <div className="formPriceDiv">
                <input
                  type="number"
                  className="formInputSmall"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min="50"
                  max="75000000"
                  required
                />
              </div>
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />

          <button className="primaryButton createListingButton" type="submit">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
