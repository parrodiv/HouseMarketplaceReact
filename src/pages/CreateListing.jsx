import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { v4 as uuidv4 } from 'uuid';
// allow to create a unique id
import { toast } from 'react-toastify';

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
  images: [],
  latitude: 0,
  longitude: 0,
};

function CreateListing() {
  // eslint-disable-next-line
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

  //SE AVESSIMO INSERITO ...formData invece che ...intialFormState avremmo ricevuto un warning che consiglia di inserire il formData come dipendenza, il che genererebbe un loop infinito andando a risettare continuamente il formData state con setFormData all'interno di useEffect

  //With declaring initalFormState outside of the component this guarantees it never changes, it's the same object in memory every time. So you won't get any linter warnings for it.

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    setLoading(true);

    if (images.length > 6 || images.length < 1) {
      setLoading(false);
      toast.error('Uploaded images are required and must be at most 6');
      return; //il return funge da blocco per non far proseguire il codice
    }

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('discounted price must be less than regular price');
      return;
    }

    //GEOLOCATION WITH positionstackAPI
    let geolocation = {}; //geolocation {lat: , lng: } in firestore we set data in this format style
    let location; //it will contain address

    if (geolocationEnabled) {
      try {
        //INSERTED WITH GEOLOCATION ENABLED
        const response = await fetch(
          `https://api.positionstack.com/v1/forward?access_key=${process.env.REACT_APP_GEOCODE_API_KEY}&query=${address}`
        );

        const data = await response.json();

        console.log(data.data[0]);
        // SE L'ADDRESS INSERITO NEL FORM E' SBAGLIATO IL RISULTATO DI data.data[0] SARA' undefined. PER QUESTO INSERISCO IL PUNTO DI DOMANDA .data[0]?. ALTRIMENTI DAREBBE QUESTO ERRORE: 'Uncaught TypeError: Cannot read properties of undefined (reading 'latitude')
        geolocation.lat = data.data[0]?.latitude ?? 0;
        geolocation.lng = data.data[0]?.longitude ?? 0;
        // if data.results[0] does not exist, we need to return undefined immediately, so that it will evaluate to the default value of 0.

        location = data.data.length < 1 && undefined;

        console.log(location);
        //if data.data[0] doesn't exists it will be undefined

        if (location === undefined) {
          setLoading(false);
          toast.error('Please enter a correct address');
          return;
        }
      } catch (error) {
        console.log(error);
        toast.error('Failure with fetch geolocation');
      }
    } else {
      // INSERTED MANUALLY WITHOUT GEOLOCATION
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    // STORE IMAGE IN FIREBASE STORAGE
    // after inserting the images in the form, onMutate function is set to create some sort of image array
    const storeImage = async (image) => {
      // image will be object in images array that will be passed trough a map function
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
              //it will return a downloadURL for each image
            });
          }
        );
      });
    };

    //The storeImage function only stores one image at a time, so in order to call it multiple times and essentially do something when they are all uploaded you would need the storeImage function to return a Promise, that you can await the resolution of somewhere else when you use the function.

    console.log(images);

    const imgUrls = await Promise.all(
      // loop trough images array
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Images not uploaded');
      return;
    });

    // console.log(imgUrls);

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    //set location universal for both cases (with geocoding or manual entry of coordinates) because sometimes the address is not taken correctly by the geocode API
    formDataCopy.location = address;

    //delete images arr from formDataCopy because i alredy have imgUrls
    delete formDataCopy.images;

    //delete address because i already have location that will contain address
    delete formDataCopy.address;

    //if there is no offer, delete discounted price
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    console.log(formDataCopy);

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);

    setLoading(false);
    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }

    if (e.target.value === 'false') {
      boolean = false;
    }

    //Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files, //list of images similar to arr
      }));
    }
    // console.log(e.target.files);
    // se il click avviene nel input:file dopo aver selezionato l'img o imgs in console appare un similar-array con le immagini

    //Text / Booleans / Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        // se boolean è null restituisci e.target.value (for text field / numbers)
        // se boolean è true o false allora non viene considerato il e.target.value
        [e.target.id]: boolean ?? e.target.value,
      }));
      // console.log(boolean);
      // console.log(e.target.value);
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
            {type === 'rent' && <p className="formPriceText">€ / Month</p>}
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
