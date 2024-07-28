
sap.ui.define([
], function() {
  return {
    async loadArcGisObjects(component) {
      return new Promise((resolve) => {
        require([
				
          "esri/config",
          "esri/Map",
          "esri/views/MapView",
          "esri/widgets/Locate",
          "esri/Graphic",
          "esri/layers/GraphicsLayer",
          "esri/geometry/SpatialReference",
          "esri/geometry/Polygon",
          "esri/layers/FeatureLayer",
          "esri/widgets/Search",
          "esri/widgets/Sketch"
          
        ],
          (esriConfig, Map, MapView, Locate, Graphic, GraphicsLayer, SpatialReference, Polygon, FeatureLayer, Search, Sketch) => {
            component.arcgis.esriConfig = esriConfig;
            component.arcgis.Map = Map;
            component.arcgis.MapView = MapView;
            component.arcgis.Locate = Locate;
            component.arcgis.Graphic = Graphic;
            component.arcgis.GraphicsLayer = GraphicsLayer;
            component.arcgis.SpatialReference = SpatialReference;
            component.arcgis.Polygon = Polygon;
            component.arcgis.FeatureLayer = FeatureLayer;
            component.arcgis.Search = Search;
            component.arcgis.Sketch = Sketch;

            resolve();
          })
      });
      
    }
  };
});