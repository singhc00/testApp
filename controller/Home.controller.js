sap.ui.define([
	"FieldMobility/controller/BaseController",
	"FieldMobility/util/ArcGis",
	"sap/ui/core/Popup",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Controller, ArcGis, Popup, Button, VBox, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("FieldMobility.controller.Home", {
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
				 "esri/layers/FeatureLayer"
			],
				(esriConfig, Map, MapView, Locate, Graphic, GraphicsLayer, SpatialReference, Polygon, FeatureLayer) => {
					esriConfig.apiKey = "AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL";

					const map = new Map({
						basemap: baseMapName //"arcgis/topographic" // basemap styles service
					});
					controller.map = map;
					this.mapView = new MapView({
						map: map,
						center: centerPoint, // Longitude, latitude
						zoom: zoomLevel, // Zoom level
						container: mapDivId // Div element
					});

					this.mapView.on('click', (event) => {
						this.mapViewClicked(event);
					});
					
					controller.addFeatureLayer(FeatureLayer);

					const locate = new Locate({
						view: this.mapView,
						useHeadingEnabled: false,
						goToOverride: function (view, options) {
							options.target.scale = 1500;
							return view.goTo(options.target);
						}
					});
					this.mapView.ui.add(locate, "top-left");

					controller.addPoints(GraphicsLayer, Graphic);

				});
		},

		onInit() {
			//this.setEsriMapConfiguration();
			this.intializeViewModel();
		},
		intializeViewModel() {
			let viewModel = this.getView().getModel("viewModel");
			if (!viewModel) {
				viewModel = new JSONModel();
				this.getView().setModel(viewModel, "viewModel");
			}

			this.initializeViewData();
		},
		initializeViewData() {

			let viewModel = this.getView().getModel("viewModel");
			viewModel.setData({
				pageBusy: false,
				submitVisible: window.nsWebViewInterface ? true : false
			});
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
				}],
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
			this.initializeMap('topography', 'mapContainer', [138.608640, -35.042099], 15);
			//this.initializeMap('streets', 'mapContainer', [-118.818984489994, 34.0137559967283], 15);
			//[-118.818984489994, 34.0137559967283]
		},
		mapViewClicked(event) {
			this.mapView.hitTest(event.screenPoint)
				.then((response) => {
					console.log(response);
					if (response.results && response.results.length > 0) {
						this.openActionSheet();

					}
				});

		},
		addPoints(GraphicsLayer, Graphic) {
			const points = [
				{
					type: "point",
					longitude: 138.62232002545724,
					latitude: -35.0459875724086, 
				},
				{ 
					type: "point",
					longitude: 138.608640,
					latitude: -35.042099
	
				},
				{ 
					type: "point",
					longitude: 138.60963268949928,
					latitude: -35.04388314436227
	
				},
				{ 
					type: "point",
					longitude: 138.6114911884523,
					latitude: -35.04375019098281
	
				}
			];

			for(const point of points) {
				this.addPoint(GraphicsLayer, Graphic, point);
			}
			
		},
		/**
		 * Add point to the map
		 * @param {*} GraphicsLayer 
		 * @param {*} Graphic 
		 */
		addPoint(GraphicsLayer, Graphic, point) {
			const graphicsLayer = new GraphicsLayer();
			graphicsLayer.on("click", () => {
				console.log('Point Clicked');
			});
			this.map.add(graphicsLayer);

			// const point = { //Create a point
			// 	type: "point",
			// 	longitude: 138.608640,
			// 	latitude: -35.042099

			// };

			//[138.608640, -35.042099]
			let simpleMarkerSymbol = {
				type: "simple-marker",
				color: [226, 119, 40],  // Orange
				outline: {
					color: [255, 255, 255], // White
					width: 1
				}
			};
			  simpleMarkerSymbol = {
				type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
				url: './images/marker.png',
				width: "50px",
				height: "50px"
			  };
			  
			  

			const pointGraphic = new Graphic({
				geometry: point,
				symbol: simpleMarkerSymbol,
				attributes: {
					OrderNumber: '100032569',
					type: 'Order'
				}
			});
			graphicsLayer.add(pointGraphic);
		},
		/**
		 * Adds a feature layer
		 */
		addFeatureLayer(FeatureLayer) {
			//Trailheads feature layer (points)
			const trailsLayer = new FeatureLayer({
				url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
			  });

			this.map.add(trailsLayer, 0);
		},
		/**
		 * Method opens an action sheet for the object type
		 */
		async openActionSheet(attributes) {
			const viewModel = this.getView().getModel("viewModel");
			
			if(window.nsWebViewInterface) {
				this.nativeScriptOpenBottomSheet();
				return;
			}
			this.openOrderDialog();
			return;
			if (this.orderInfoPopupContent) {
				this.openOrderPopup(this.orderInfoPopupContent);
				return;
			}

			viewModel.setProperty("/pageBusy", true);
			const orderInfoPopupContent = await sap.ui.core.Fragment.load({
				type: "XML",
				name: "FieldMobility.view.fragments.OrderInfoWeb",
				controller: this
			});

			viewModel.setProperty("/pageBusy", false);
			this.orderInfoPopupContent = orderInfoPopupContent;
			this.getView().addDependent(this.orderInfoPopupContent);
			this.openOrderPopup(this.orderInfoPopupContent);


		},
		async openOrderDialog() {
			if(!this.jobDetailsDialog) {
				const jobDetailsDialog = await sap.ui.core.Fragment.load({
					type: "XML",
					name: "FieldMobility.view.fragments.JobDetailsDialog",
					controller: this
				});
				this.jobDetailsDialog = jobDetailsDialog;
				this.getView().addDependent(this.jobDetailsDialog);
			}

			this.jobDetailsDialog.open();
		},
		openOrderPopup(content) {
			
			const originalOnAfterRendering = content.onAfterRendering;
			const controller = this;
			content.onAfterRendering = function () {
				if (originalOnAfterRendering) {
					originalOnAfterRendering.apply(this, arguments);
				}
				controller.bottomPopupAfterRendering.apply(this);
			}.bind(content);

			const popup = new Popup(content, false, false, false);
			popup.open(0, sap.ui.core.Popup.Dock.CenterBottom, sap.ui.core.Popup.Dock.CenterBottom, document);
		},
		/**
		 * Opens nativescript bottom sheet
		 */
		nativeScriptOpenBottomSheet() {
			window.nsWebViewInterface.emit('showBottomSheet', {
				url: '',
				hash: 'jobDetails'
			});
		},
		bottomPopupAfterRendering() {
			debugger;
			const gesuredZone = this.getDomRef();
			var touchstartX = 0;
			var touchstartY = 0;
			var touchendX = 0;
			var touchendY = 0;
			const handleGesure = function() {
				var swiped = 'swiped: ';
				if (touchendX < touchstartX) {
					console.log(swiped + 'left!');
				}
				if (touchendX > touchstartX) {
					console.log(swiped + 'right!');
				}
				if (touchendY < touchstartY) {
					console.log(swiped + 'down!');
				}
				if (touchendY > touchstartY) {
					console.log(swiped + 'left!');
				}
				if (touchendY == touchstartY) {
					console.log('tap!');
				}
			}
			gesuredZone.addEventListener('touchstart', function (event) {
				touchstartX = event.screenX;
				touchstartY = event.screenY;
			}, false);

			gesuredZone.addEventListener('touchend', function (event) {
				touchendX = event.screenX;
				touchendY = event.screenY;
				handleGesure();
			}, false);

			
		}
	});

});