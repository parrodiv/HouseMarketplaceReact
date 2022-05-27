import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get a reference
        const listingsRef = collection(db, 'listings');

        // Create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          //params.categoryName -> (rent or sale), see in App.js :categoryName
          orderBy('timestamp', 'desc'),
          limit(2)
        );

        // Execute query
        const querySnap = await getDocs(q);
        // console.log(querySnap);

        // get the last Listing Item visible of the listings
        //in array if you want to get the last one, the number will be always one less than the length of the array (querySnap.docs[2] for the third item)
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        // console.log(lastVisible);

        const listings = [];

        querySnap.forEach((doc) => {
          // console.log(doc.data()) //obj with listing
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
        // console.log(listings); //var not state
      } catch (error) {
        toast.error('Could not fetch listings');
        console.log(error);
      }
    };

    fetchListings();
  }, [params.categoryName]);

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      // Get a reference
      const listingsRef = collection(db, 'listings');

      // Create a query
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing), //lastVisible item
        limit(10)
      );

      // Execute query
      const querySnap = await getDocs(q);
      // console.log(querySnap);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);
      // console.log(lastVisible);

      const listings = [];

      querySnap.forEach((doc) => {
        // console.log(doc.data()) //obj with listing
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      // the new listings state will be an array with the objects that were there before in the previous state plus the new objects obtained
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
      console.log(listings); //var not state
    } catch (error) {
      toast.error('Could not fetch listings');
      console.log(error);
    }
  };

  console.log(listings); //state

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {/* when I click "load more" button for the second time the lastVisible variable will be undefined and therefore you will see "No more listing to fetch .." because lastFetchedListing state will be undefined  */}
          {lastFetchedListing ? (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          ) : (
            <p style={{ textAlign: 'center' }}>No more listing to fetch..</p>
          )}
        </>
      ) : (
        <p>There are no offers</p>
      )}
    </div>
  );
}

export default Category;
