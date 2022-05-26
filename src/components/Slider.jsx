import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import formatMoney from '../Intl /formatMoney';

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get a reference
        const listingsRef = collection(db, 'listings');

        // Create a query
        //in computer science, querying a database to extract or update data that meet a certain search criterion.
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));

        // Execute query
        const querySnap = await getDocs(q);
        // console.log(querySnap);

        const listings = [];

        //per ogni doc all'interno di querysnap inserisco all'interno del listings array un oggetto con due proprietà (id e data)
        querySnap.forEach((doc) => {
          // console.log(doc.data()) //obj with listing
          return listings.push({
            id: doc.id, //id of listing
            data: doc.data(), //obj with data
          });
        });

        setListings(listings);
        setLoading(false);
        console.log(listings);
      } catch (error) {
        toast.error('Could not fetch listings');
        console.log(error);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>

        <Swiper
          // install Swiper modules
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
        >
          {/* destructure single listing object within listings arr 
          instead of doing ".map(listing)" and then listing.data and listing.id I get the specific prop of obj with desctructuring*/}
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <img
                style={{ width: '100%', height: '250px', cursor: 'pointer' }}
                src={data.imgUrls[0]}
                alt={data.title}
              />
              <p className="swiperSlideText">{data.name}</p>
              <p className="swiperSlidePrice">
                {formatMoney(`${data.discountedPrice ?? data.regularPrice}`)}{' '}{data.type === 'rent' && '/ month'}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
