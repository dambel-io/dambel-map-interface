function loadMap() {
    const loadConfigScript = document.createElement('script');
    loadConfigScript.src = '../env.js';
    loadConfigScript.onload = () => {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + google_map_token + '&sensor=false&libraries=places';
        script.onload = () => {
            var map = new google.maps.Map(document.getElementById('map'), {
                center: new google.maps.LatLng(map_center_lat, map_center_lng),
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        }
        document.head.appendChild(script);
    };
    document.head.appendChild(loadConfigScript);
}

loadMap();
