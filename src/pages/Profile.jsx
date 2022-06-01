import { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { db } from '../firebase.config';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from '../components/ListingItem';

function Profile() {
  const auth = getAuth();
  // console.log(auth.currentUser);

  //it'll enable the form and we can change it and then we can click 'done' to submit that change and update the user
  const [changeDetails, setChangeDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        //Get a reference
        const listingsRef = collection(db, 'listings');

        //Create a query
        const q = query(
          listingsRef,
          where('userRef', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );

        //Execute query
        const querySnap = await getDocs(q);

        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
        console.log(listings); //var not state
      } catch (error) {
        toast.error(error.message);
        console.log(error);
      }
    };

    fetchListings();
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/sign-in');
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //update displayName in firebase obj
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        //Update in firestore database
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name: name,
        });
      }
    } catch (error) {
      toast.error('Could not update profile details');
      console.log(error);
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      //DELETE PICTURES FROM FIREBASE STORAGE
      const storage = getStorage();

      const imagesToDelete = listings.filter(
        (listing) => listing.id === listingId
      );
      console.log(imagesToDelete);

      const imagesArrUrls = imagesToDelete[0].data?.imgUrls;
      console.log(imagesArrUrls);

      imagesArrUrls.forEach((urlToDelete) => {
        //split inserisce in un nuovo array, se non trova il carattere con cui splittare inserisce semplicemente la stringa nel'array
        let fileName = urlToDelete.split('/').pop().split('#')[0].split('?')[0];

        //REPLACE "2%F" IN THE URL WITH "/" SO I CREATE A PATH ALREADY
        fileName = fileName.replace('%2F', '/');
        console.log(fileName);
        //${userId}-${imgName}-uidv4
        //const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`; (r.139 CreateListing.jsx) NELLO STORAGE LI HO SALVATI COSI

        //CREATE A REFERENCE TO THE FILE TO DELETE
        const imgToDeleteRef = ref(storage, `${fileName}`);

        //DELETE THE FILE
        deleteObject(imgToDeleteRef)
          .then(() => {
            console.log(`${fileName} removed`);
          })
          .catch((error) => {
            toast.error(error);
          });
      });
      //PER TESTARE CHE LE IMMAGINI VENGANO CANCELLATE DALLO STORAGE, COMMENTA LA PARTE VOCE VAI A CANCELLARE IL LISTING DAL FIRESTORE. COSI FACENDO VEDRAI IL LISTING SENZA L'IMMAGINE PERCHE' SONO STATE CANCELLATE

      //DELETE ON FIRESTORE DB
      const docRef = doc(db, 'listings', listingId)
      await deleteDoc(docRef)

      //UPDATE LISTINGS IN UI
      const updatedListings = listings.filter(listing => listing.id !== listingId)

      //risettando il listings state viene rerenderizzata la pagina e quindi aggiornata la lista nel UI (da r.180)
      setListings(updatedListings)
      toast.success('Successfully deleted listing')
    }
  };

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`);

  console.log(listings);

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              //if changeDetails is true then call onSubmit func
              changeDetails && onSubmit();
              //set true to false or viceversa
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              // opposite of changeDetails, if changeDetails is true then i can edit because disabled will be false and viceversa
              value={name}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow" />
        </Link>

        {/* question mark to verify if listings is null/undefined and if is so it no give us error */}
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
