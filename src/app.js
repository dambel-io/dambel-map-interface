let currentCenter;
let map;
let searchInput = document.getElementById('search-input');
let gymMarkers = [];

function loadMap()
{
    const loadConfigScript = document.createElement('script');
    loadConfigScript.src = '../env.js';
    loadConfigScript.onload = () => {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + googleMapToken + '&sensor=false&libraries=places';
        script.onload = () => {
            map = new google.maps.Map(document.getElementById('map'), {
                center: new google.maps.LatLng(mapCenterLat, mapCenterLng),
                zoom: 6,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            currentCenter = map.getCenter();
            google.maps.event.addListener(map, "idle", () => {
                const newCenter = map.getCenter();
                if (!currentCenter.equals(newCenter)) {
                    currentCenter = newCenter;
                    loadData();
                }
            });

            searchInput.onchange = () => {
                clearMarkers();
                loadData();
            }

            loadData();
        }
        document.head.appendChild(script);
    };
    document.head.appendChild(loadConfigScript);
}

loadMap();

function loadData()
{
    var url = apiHost + '/api/v1/gyms/?lat=' + currentCenter.lat() + '&lng=' + currentCenter.lng();
    if (searchInput.value != null) {
        url += '&word=' + searchInput.value;
    }

    const bounds = map.getBounds();
    if (bounds) {
        const areaInKm = calculateVisibleLandArea(bounds) * 1.5;
        url += '&radius=' + areaInKm;
    }

    fetch(url).then(res => res.json()).then(res => {
        for (var i = 0; i < res.data.length; i++) {
            const gym = res.data[i];
            var gymPosition = { lat: parseFloat(gym.location_lat), lng: parseFloat(gym.location_lng) };
            let color;
            let workingStatusTitle = '';
            if (gym.working_status == null) {
                color = 'red';
                workingStatusTitle = "Closed";
            } else if (gym.working_status.current !== undefined) {
                color = 'green';
                workingStatusTitle = "Open till " + gym.working_status.current.closes_at;
            } else if (gym.working_status.next !== undefined) {
                color = 'orange';
                workingStatusTitle = "Will open by " + gym.working_status.next.opens_at;
            } else {
                color = 'red';
                workingStatusTitle = "Closed";
            }

            const marker = new google.maps.Marker({
                position: gymPosition,
                map: map,
                icon: {
                    url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                },
            });

            gymMarkers.push(marker);

            marker.addListener("click", () => {
                var content = "<p>";
                content += "<h4>" + gym.name + "</h4>";
                content += "<span style='color: " + color + "'>" + workingStatusTitle + "</span>";
                if (gym.show_crowd && color == 'green') {
                    content += " <b>(" + gym.crowd + " people are currently in this gym)</b>";
                }
                if (gym.description != null) {
                    content += "<p>" + gym.description + "</p>";
                }
                if (gym.address != null) {
                    content += "<p><b>Address: </b>" + gym.address + "</p>";
                }
                content += "</p>";
                const infoWindow = new google.maps.InfoWindow({
                    content: content,
                });
                infoWindow.open(map, marker);
            });
        }
    });
}

function clearMarkers()
{
    for (let i = 0; i < gymMarkers.length; i++) {
        gymMarkers[i].setMap(null);
    }
    gymMarkers = [];
}

function calculateVisibleLandArea(bounds)
{
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const width = haversineDistance(ne.lat(), sw.lng(), ne.lat(), ne.lng());
    const height = haversineDistance(ne.lat(), ne.lng(), sw.lat(), ne.lng());

    const visibleArea = width * height;
    return visibleArea;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}
