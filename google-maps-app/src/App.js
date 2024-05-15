import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const center = {
  // lat: 7.2905715, // default latitude
  // lng: 80.6337262, // default longitude
  lat: 35.23833238,
  lng: -82.723830438
};

const App = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [marker, setMarker] = useState(center);
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef();
  const listenerRef = useRef();

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onAutocompleteLoad = useCallback((autoC) => {
    setAutocomplete(autoC);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = place.geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setMarker(newCenter);
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(10); // Optional: Adjust zoom level
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  }, [autocomplete]);

  useEffect(() => {
    if (autocomplete) {
      listenerRef.current = autocomplete.addListener('place_changed', onPlaceChanged);
    }
    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove();
      }
    };
  }, [autocomplete, onPlaceChanged]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <div>
      <div style={{ position: 'absolute', zIndex: 10, width: '100%' }}>
        <Autocomplete onLoad={onAutocompleteLoad}>
          <input
            type="text"
            placeholder="Enter a town"
            style={{
              boxSizing: 'border-box',
              border: '1px solid transparent',
              width: '240px',
              height: '32px',
              padding: '0 12px',
              borderRadius: '3px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              fontSize: '14px',
              outline: 'none',
              textOverflow: 'ellipses',
              margin: '10px auto',
              display: 'block',
            }}
          />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={marker}
        onLoad={onLoad}
      >
        <Marker position={marker} />
      </GoogleMap>
    </div>
  );
};

export default App;