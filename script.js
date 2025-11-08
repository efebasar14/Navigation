// Harita merkez koordinatları (Türkiye'nin yaklaşık merkezi)
const initialCoordinates = [39.0, 35.0]; // Türkiye'nin merkez koordinatları

// Haritayı oluştur
const map = L.map('map').setView(initialCoordinates, 6);

// OpenStreetMap katmanı ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Geocoder kontrolünü ekle
const geocoder = L.Control.geocoder().addTo(map);

// Rota kontrolcüsü
let routeControl = null;

// Adresi koordinatlara dönüştürme fonksiyonu
function geocode(address, callback) {
    geocoder.options.geocoder.geocode(address, callback);
}

// Yol tarifi hesaplama fonksiyonu
function calculateRoute() {
    const startAddress = document.getElementById('start').value;
    const endAddress = document.getElementById('end').value;

    geocode(startAddress, (startResults) => {
        if (startResults.length > 0) {
            const startCoordinates = startResults[0].center;

            geocode(endAddress, (endResults) => {
                if (endResults.length > 0) {
                    const endCoordinates = endResults[0].center;

                    if (routeControl) {
                        map.removeControl(routeControl);
                    }

                    routeControl = L.Routing.control({
                        waypoints: [
                            L.latLng(startCoordinates.lat, startCoordinates.lng),
                            L.latLng(endCoordinates.lat, endCoordinates.lng)
                        ],
                        routeWhileDragging: true,
                        router: L.Routing.osrmv1({
                            serviceUrl: 'https://router.project-osrm.org/route/v1'
                        }),
                        createMarker: function (i, wp, nWps) {
                            var markerOptions = {
                                draggable: true,
                                icon: L.icon({
                                    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]
                                })
                            };
                            return L.marker(wp.latLng, markerOptions)
                                .bindPopup(`<b>${i === 0 ? 'Başlangıç' : i === nWps - 1 ? 'Bitiş' : 'Ara Nokta'}</b>`);
                        }
                    }).addTo(map);
                } else {
                    alert("Bitiş adresi bulunamadı.");
                }
            });
        } else {
            alert("Başlangıç adresi bulunamadı.");
        }
    });
}

// Türkiye'nin coğrafi sınırlarına uygun rastgele potansiyel radar noktaları oluşturma
function addPotentialRadars(center, numPoints, radius) {
    const minLat = 36.0;
    const maxLat = 42.0;
    const minLng = 26.0;
    const maxLng = 45.0;

    for (let i = 0; i < numPoints; i++) {
        const lat = Math.random() * (maxLat - minLat) + minLat;
        const lng = Math.random() * (maxLng - minLng) + minLng;
        L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Speaker_Icon.svg',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [1, -10]
            })
        }).addTo(map)
            .bindPopup(`<b>Potansiyel Radar</b>`);
    }
}

// Türkiye genelinde rastgele radar noktalarını ekle
addPotentialRadars(initialCoordinates, 50, 5000);

// Canlı konum takibi için marker
let liveLocationMarker = null;

function useLiveLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                document.getElementById('start').value = `${lat}, ${lng}`;

                map.setView([lat, lng], 16);

                if (liveLocationMarker) {
                    liveLocationMarker.setLatLng([lat, lng]);
                } else {
                    liveLocationMarker = L.marker([lat, lng], {
                        icon: L.icon({
                            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Blue_dot_icon.svg',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                            popupAnchor: [1, -10]
                        })
                    }).addTo(map)
                        .bindPopup("Canlı Konumunuz");
                }
            },
            error => {
                alert("Konum bilgisine erişilemiyor.");
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Tarayıcınız konum servisini desteklemiyor.");
    }
}
