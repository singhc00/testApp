sap.ui.define([
	"sap/ui/core/mvc/Controller" ,
	"FieldMobility/util/ArcGis"
], function (Controller, ArcGis) {
	"use strict";

	return Controller.extend("FieldMobility.controller.View1", {
		initializeMap(baseMapName, mapDivId, centerPoint, zoomLevel) {
			const controller = this;
			ArcGis.require(["esri/config",
			"esri/Map",
			"esri/views/MapView",
			"esri/widgets/Locate",
			"esri/Graphic",
			"esri/layers/GraphicsLayer",
			"esri/geometry/SpatialReference",
			"esri/geometry/Polygon",
			], 
				function(esriConfig, Map, MapView, Locate, Graphic, GraphicsLayer, SpatialReference, Polygon) {
				esriConfig.apiKey = "AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL";
			
					const map = new Map({
					  basemap: baseMapName //"arcgis/topographic" // basemap styles service
					});
					controller.map = map;
					const view = new MapView({
					  map: map,
					  center: centerPoint, // Longitude, latitude
					  zoom: zoomLevel, // Zoom level
					  container: mapDivId // Div element
					});

					const locate = new Locate({
						view: view,
						useHeadingEnabled: false,
						goToOverride: function(view, options) {
						  options.target.scale = 1500;
						  return view.goTo(options.target);
						}
					  });
					  view.ui.add(locate, "top-left");
					
					  controller.addPoint(GraphicsLayer, Graphic);
			  });
		  },
	  
		  onInit() {
			//this.setEsriMapConfiguration();
		  },
		  /**
		   * Sets ESRI Map configuration
		   */
		  setEsriMapConfiguration() {
			const oGeoMap = this.byId("vbi2");
			var oMapConfig = {
				"MapProvider": [{
					"name": "ESRI",
					"tileX": "256",
					"tileY": "256",
					"Source": [{
						"id": "s1",
						//"url": "https://ibasemaps-api.arcgis.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tilemap/13/3264/1376/32/32?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
						//"url": "/arcgis/MapServer?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
						//"url": "/arcgis/MapServer/tile/13/3272/1393?token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL",
						"url": "https://ibasemaps-api.arcgis.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/13/3272/1393?token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
						//"url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
					}]
				}] ,
					"MapLayerStacks": [{
						"name": "DEFAULT",
						"MapLayer": {
							"name": "layer1",
							"refMapProvider": "ESRI",
							"opacity": "1",
							"colBkgnd": "RGB(255,255,255)"
						}
					}]
			};

			
			oGeoMap.setMapConfiguration(oMapConfig);
			oGeoMap.setRefMapLayerStack("DEFAULT");
		  },
		  onAfterRendering() {
			this.initializeMap('streets', 'mapContainer', [138.608640, -35.042099], 15);
			//this.initializeMap('streets', 'mapContainer', [-118.818984489994, 34.0137559967283], 15);
			//[-118.818984489994, 34.0137559967283]
		  },
		  addPoint(GraphicsLayer, Graphic) {
			const graphicsLayer = new GraphicsLayer();
			this.map.add(graphicsLayer);
		   
			const point = { //Create a point
			   type: "point",
			   longitude: 138.608640,
			   latitude: -35.042099
			};

			//[138.608640, -35.042099]
			const simpleMarkerSymbol = {
			   type: "simple-marker",
			   color: [226, 119, 40],  // Orange
			   outline: {
				   color: [255, 255, 255], // White
				   width: 1
			   }
			};

			const pointGraphic = new Graphic({
				geometry: point,
				symbol: simpleMarkerSymbol
			 });
			 graphicsLayer.add(pointGraphic);
		  },
		  addPolygon(Polygon, GraphicsLayer, SpatialReference, Graphic) {
			const graphicsLayer = new GraphicsLayer();
			this.map.add(graphicsLayer);
			// Create a polygon geometry
			const polygon = {
				type: "polygon",
				rings: [
					[-118.818984489994, 34.0137559967283], //Longitude, latitude
					[-118.806796597377, 34.0215816298725], //Longitude, latitude
					[-118.791432890735, 34.0163883241613], //Longitude, latitude
					[-118.79596686535, 34.008564864635],   //Longitude, latitude
					[-118.808558110679, 34.0035027131376]  //Longitude, latitude
				],
				spatialReference: SpatialReference.WGS84
			};

			const simpleFillSymbol = {
				type: "simple-fill",
				color: [227, 139, 79, 0.8],  // Orange, opacity 80%
				outline: {
					color: [255, 255, 255],
					width: 1
				}
			};

			const polygonObj = new Polygon({
				type: "polygon",
				rings: polygon.rings,
				//symbol: simpleFillSymbol,
				spatialReference: new SpatialReference({
					wkid: 4326
				  })
			});

			const polygonGraphic = new Graphic({
				geometry: polygonObj,
				symbol: simpleFillSymbol
			})
			graphicsLayer.add(polygonGraphic);
		  }
	});

});