const Map = ol.Map;
const Stamen = ol.source.Stamen;
const TileLayer = ol.layer.Tile
const View = ol.View
const Proj = ol.proj
const parser = new ol.format.WMTSCapabilities();
const extent = [420000, 30000, 900000, 350000];

const coord_default = "EPSG:3857";
const coord_world = "EPSG:4326";

var clustermap;

const chLayer = new TileLayer({
  source: new Stamen({
    layer: 'toner',
  }),
})

function loadClusterMap(date) {
  $('#clustermap').empty()
  delete clustermap;
  var clustermap = new ol.Map({
    target: "clustermap",
    layers: [chLayer],
    view: new ol.View({
      center: ol.proj.fromLonLat([6.632492959462926, 46.519704897854744]),
      zoom: 14,
    }),
    logo: false,
  });
}
