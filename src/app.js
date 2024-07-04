let currentCenter;
let map;
let searchInput = document.getElementById('search-input');

function loadMap()
{
    const loadConfigScript = document.createElement('script');
    loadConfigScript.src = '../env.js';
    loadConfigScript.onload = () => {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + google_map_token + '&sensor=false&libraries=places';
        script.onload = () => {
            map = new google.maps.Map(document.getElementById('map'), {
                center: new google.maps.LatLng(map_center_lat, map_center_lng),
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            currentCenter = map.getCenter();
            google.maps.event.addListener(map, "idle", () => {
                const newCenter = map.getCenter();
                if (!currentCenter.equals(newCenter)) {
                    currentCenter = newCenter;
                    loadData(currentCenter);
                }
            });

            searchInput.onchange = () => {
                loadData(currentCenter);
            }
        }
        document.head.appendChild(script);
    };
    document.head.appendChild(loadConfigScript);
}

loadMap();

function loadData(location)
{
    var url = api_host + '/api/v1/gyms/?lat=' + location.lat() + '&lng=' + location.lng();
    if (searchInput.value != null) url += '&word=' + searchInput.value;
    console.log(url);
}
