let map;
let markers = [];
let selectedWaypoints = [];
let directionsService;
let directionsRenderer;

function initMap() {
    const location = { lat: 38.72570143190969, lng: -9.149985452443389 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
            { "featureType": "poi.business", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "featureType": "building", "elementType": "geometry", "stylers": [{ "color": "#343434" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#030303" }] },
            { "featureType": "landscape", "stylers": [{ "color": "#161616" }] },
            { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
            { "elementType": "labels.text", "stylers": [{ "visibility": "on" }, { "color": "#000000" }, { "weight": 0.6 }, { "fontSize": 6 }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#FFFFFF" }, { "visibility": "on" }] },
            { "elementType": "labels", "stylers": [{ "visibility": "off" }] },
            { "featureType": "road", "elementType": "labels.text", "stylers": [{ "visibility": "on" }] }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);


    //comment after prot

    const qrCodes = [
        { lat: 38.710186, lng: -9.139109, title: "QR Code 1 - Praça do Comércio" },
        { lat: 38.711346, lng: -9.136726, title: "QR Code 2 - Rua Augusta" },
        { lat: 38.712345, lng: -9.140200, title: "QR Code 3 - Cais das Colunas" },
        { lat: 38.713500, lng: -9.137800, title: "QR Code 4 - Arco da Rua Augusta" },
        { lat: 38.707006, lng: -9.152476 },
        { lat: 38.730121, lng: -9.474325 },
        { lat: 38.768584, lng: -9.035272 },
    ];

    qrCodes.forEach(qrCode => {
        const marker = new google.maps.Marker({
            position: { lat: qrCode.lat, lng: qrCode.lng },
            map: map,
            title: qrCode.title,
        });

        marker.addListener('click', () => {
            handleWaypointSelection(marker);
        });

        markers.push(marker);
    });

    //comment after prot



    // Fetch QR codes from the server that are not in any event
    fetch('https://maltinha.ddns.net/lqrcodes')
        .then(response => response.json())
        .then(lqrcodes => {
            lqrcodes.forEach(qrcode => {
                if (qrcode.lqrcode_is_event) {
                    return;
                }
                const marker = new google.maps.Marker({
                    position: { lat: qrcode.lqrcode_latitude, lng: qrcode.lqrcode_longitude },
                    map: map,
                    title: `QR Code at ${qrcode.lqrcode_latitude}, ${qrcode.lqrcode_longitude}`
                });

                marker.addListener('click', () => {
                    handleWaypointSelection(marker);
                });

                markers.push(marker);
            });
        })
        .catch(error => console.error('Error fetching QR codes:', error));
}

function handleWaypointSelection(marker) {
    const markerIndex = selectedWaypoints.indexOf(marker);
    if (markerIndex === -1) {
        selectedWaypoints.push(marker);
        marker.setIcon('https://maps.google.com/mapfiles/ms/icons/blue-dot.png');
    } else {
        selectedWaypoints.splice(markerIndex, 1);
        marker.setIcon('https://maps.google.com/mapfiles/ms/icons/red-dot.png');
    }

    if (selectedWaypoints.length > 1) {
        calculateAndDisplayRoute();
    } else {
        directionsRenderer.setDirections({ routes: [] });
    }
}

function calculateAndDisplayRoute() {
    if (selectedWaypoints.length < 2) {
        return;
    }

    const waypoints = selectedWaypoints.slice(1, -1).map(marker => ({
        location: marker.getPosition(),
        stopover: true,
    }));

    const origin = selectedWaypoints[0].getPosition();
    const destination = selectedWaypoints[selectedWaypoints.length - 1].getPosition();

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING,
        },
        (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', initMap);
