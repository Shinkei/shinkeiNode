function autocomplete(input, latitude, longitude){
  if(!input) return;

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latitude.value = place.geometry.location.lat();
    longitude.value = place.geometry.location.lng();
  });

  //prevent to submit the form if the user press enter in the field address
  input.on('keydown', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });
}

export default autocomplete;