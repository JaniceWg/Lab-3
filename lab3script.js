mapboxgl.accessToken = 'pk.eyJ1IjoiamFuamFudyIsImEiOiJjbGRtMHNyNDYwMXh3M29rZHlscTNic2tqIn0.GKtLpllzMPD6I4AIRIS7Yw';  

// Add mapbox style, longitude, latitude, and zoom 
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/janjanw/cle12f0od000701nxtivzx3wg',
    center: [-79.3, 43.5],
    zoom: 9,
});


// Add the control to the map for address search bar.
map.addControl(
    new MapboxGeocoder({
        accessToken:mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

// This code allows the user to use coordinates to search up the location instead of typing the address. 
const coordinatesGeocoder = function (query) {

    const matches = query.match(
        /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
    );
    if (!matches) {
        return null;
    }

    function coordinateFeature(lng, lat) {
        return {
            center: [lng, lat],
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            place_name: 'Lat: ' + lat + ' Lng: ' + lng,
            place_type: ['coordinate'],
            properties: {},
            type: 'Feature'
        };
    }

    const coord1 = Number(matches[1]);
    const coord2 = Number(matches[2]);
    const geocodes = [];

    if (coord1 < -90 || coord1 > 90) {
        // must be lng, lat
        geocodes.push(coordinateFeature(coord1, coord2));
    }

    if (coord2 < -90 || coord2 > 90) {
        // must be lat, lng
        geocodes.push(coordinateFeature(coord2, coord1));
    }

    if (geocodes.length === 0) {
        // else could be either lng, lat or lat, lng
        geocodes.push(coordinateFeature(coord1, coord2));
        geocodes.push(coordinateFeature(coord2, coord1));
    }

    return geocodes;
};

// Add the control to the map for the coordinate search bar.
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        zoom: 4,
        placeholder: 'Try: -40, 170',
        mapboxgl: mapboxgl,
        reverseGeocode: true
    })
);
//Add zoom and rotation function
map.addControl(new mapboxgl.NavigationControl());

//Add fullscreen option 
map.addControl(new mapboxgl.FullscreenControl());

// load data sources and layers
map.on('load', () => {

// Add source from GeoJSON file 
    map.addSource('museum', {
        type: 'geojson',
        data: {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "Museum": "Bata Shoe"
                    },
                    "geometry": {
                        "coordinates": [
                            -79.40014963621763,
                            43.667250216379074
                        ],
                        "type": "Point"
                    }
                }
            ]
        }
    });

    // Add layer and format the size of the point and colour 
    map.addLayer({
        'id': 'museum-building',
        'type': 'circle',
        'source': 'museum',
        'paint': {
            'circle-radius': [
                'interpolate', 
                ['linear'], 
                ['zoom'], 
                8, 10, 
                12, ['*', ['get', 'capacity'], 100] 
            ],
            'circle-color': '#EEA530'
        }

    });

    // Add GeoJSON url to obtain the source
    map.addSource('uoft-haunted-buildings', {
        type: 'geojson',
        data: 'https://janicewg.github.io/lab1/map.geojson'

    });

    // Draw GeoJSON circles
    map.addLayer({
        'id': 'uoft-haunted-buildings',
        'type': 'circle',
        'source': 'uoft-haunted-buildings',
        'paint': {
            'circle-radius': [
                'interpolate', 
                ['linear'], 
                ['zoom'], 
                10, 20, 
                12, ['*', ['get', 'capacity'], 100] 
            ],
            'circle-color': 'pink'

        }

    });
    // Draw GeoJSON labels using 'Location' property
    map.addLayer({
        'id': 'uoft-haunted-buildings-labels',
        'type': 'symbol',
        'source': 'uoft-haunted-buildings',
        'layout': {
            'text-field': ['get', 'Location'],
            'text-variable-anchor': ['bottom'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto'
        }

    });

    // Add the data from my mapbox tileset
    map.addSource('Pedestrian_Network_Data-46q6pd', {
        'type': 'vector',
        'url': 'mapbox://janjanw.bv9pgpop'
    });

    // Style the lines by changing the colour, opacity, and outline colour. Also add source layer to get the data.
    map.addLayer({
        'id': 'Pedestrian_Network_Data-46q6pd',
        'type': 'fill',
        'source': 'Pedestrian_Network_Data-46q6pd',
        'paint': {
            'fill-color': '#33ff33',
            'fill-opacity': 0.4,
            'fill-outline-color': 'black'
        },
        'source-layer': 'Pedestrian_Network_Data-46q6pd-fill'
    },
     // Drawing order: this layer should be at the bottom of everything
        'Pedestrian_Network_Data-46q6pd'

    );

});
// Add hover event to show the names of the UofT buildings
map.on('mousemove', 'uoft-haunted-buildings', (e) => {
    if (e.features.length > 0) { 
        e.features[0]
        map.setFilter('uoft-haunted-buildings-labels', ['==', ['get', 'Location'], e.features[0].properties.Location]);
    }
});

//Add a display popup for each building on click
map.on('mouseenter', 'uoft-haunted-buildings', () => {
    map.getCanvas().style.cursor = 'pointer'; 
});

map.on('mouseleave', 'uoft-haunted-buildings', () => {
    map.getCanvas().style.cursor = ''; 
});

map.on('click', 'uoft-haunted-buildings', (e) => {
    console.log (e)
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Property of: </b>" + "University of Toronto")
        .addTo(map);
});
 