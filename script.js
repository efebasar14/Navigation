<script>
  // ... yukarıdaki map kurulum kodun burada olsun ...

  // --- DOĞRUDAN CLIENT-TARAFI ORS KULLANIMI (TEST İÇİN) ---
  const ORS_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4YmVkZTdhZmZiNzQ4M2E4MTZiNmNiZmE2MDIxN2M3IiwiaCI6Im11cm11cjY0In0="; // <-- buraya kendi anahtarını yaz

  async function setDestination(latlng) {
    // hedef marker
    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker(latlng, { icon: L.icon({ iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize:[36,36] }) })
                 .addTo(map).bindPopup('Hedef').openPopup();

    // kullanıcı konumunu al
    if (!navigator.geolocation) return alert('Konum servisleri desteklenmiyor');
    navigator.geolocation.getCurrentPosition(async pos => {
      const start = [pos.coords.longitude, pos.coords.latitude]; // lon,lat
      const end = [latlng.lng, latlng.lat];

      try {
        // ORS directions (POST -> geojson) doğrudan client'tan
        const resp = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': ORS_KEY    // Authorization header veya ?api_key=... kullanılabilir
          },
          body: JSON.stringify({
            coordinates: [ start, end ],
            instructions: true
          })
        });

        if (!resp.ok) {
          const t = await resp.text();
          throw new Error('ORS error: ' + resp.status + ' - ' + t);
        }

        const data = await resp.json();
        renderRouteOnMap(data); // daha önce yazdığın fonksiyon
      } catch (err) {
        console.error(err);
        alert('Rota alınırken hata: ' + err.message);
      }
    }, e => alert('Konum alınamadı: ' + e.message), { enableHighAccuracy: true });
  }
  // --- burada diğer kodlar devam ediyor ---
</script>
