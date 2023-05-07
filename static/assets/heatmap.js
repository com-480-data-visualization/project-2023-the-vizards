
const VectorSource = ol.source.Vector;
const HeatmapLayer = ol.layer.Heatmap;
const LayerGroup = ol.layer.Group;

const blur = 15;
const radius = 10;

var heatmap;
var heatmapLayers;
var zoomHeatmap = 14;
var centerHeatmap = ol.proj.fromLonLat([6.632492959462926, 46.519704897854744])

const raster = new TileLayer({
    source: new Stamen({
        layer: 'toner',
    }),
});

function loadHeatMap(date) {
    var source = new VectorSource();

    return new Promise((resolve, reject) => {
        d3.csv(`data/heatmap_data/${date}.csv`).then(function (data) {
            var features = [];
            data.forEach(line => {
                const feature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(line.lon), parseFloat(line.lat)])),
                    stop_name: line.stop_name,
                    size: line.size,
                    hour: line.hour
                });
                features.push(feature);
            });
            source.addFeatures(features);

            delete heatmapLayers

            heatmapLayers = new LayerGroup({ layers: [] }); // Create a layer group to hold all heatmap layers

            for (let i = 0; i < 24; i++) {
                let heatmapLayer = new HeatmapLayer({
                    source: source,
                    blur: blur,
                    radius: radius,
                    visible: true, // Set the initial visibility based on the selected hour
                    hour: i, // Add a custom 'hour' property to the layer
                    weight: function (feature) {
                        return feature.get('hour') == i ? feature.get('size') : 0
                    },
                });
                heatmapLayers.getLayers().push(heatmapLayer); // Add the heatmap layer to the layer group
            }

            $('#heatmap').empty()
            delete heatmap

            var heatmap_view = new View({
                center: centerHeatmap,
                zoom: zoomHeatmap,
            })
            
            heatmap = new Map({
                layers: [raster, heatmapLayers], // Add all heatmap layers to the map
                target: 'heatmap',
                view: heatmap_view,
                logo: false
            });

            heatmap.on('moveend', function (e) {
                zoomHeatmap = heatmap.getView().getZoom();
            });

            heatmap_view.on('change:center', function(){
                centerHeatmap = heatmap_view.getCenter();
            });

            resolve();
        })
    })
}

function switchHeatmapLayer(hour) {
    heatmapLayers.getLayers().forEach(layer => {
        layer.setVisible(layer.get('hour') == hour);
    });
}
