sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"FieldMobility/util/ArcGis",
	"sap/ui/core/Popup",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Controller, ArcGis, Popup, Button, VBox, Fragment, JSONModel) {
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
				(esriConfig, Map, MapView, Locate, Graphic, GraphicsLayer, SpatialReference, Polygon) => {
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

					const locate = new Locate({
						view: this.mapView,
						useHeadingEnabled: false,
						goToOverride: function (view, options) {
							options.target.scale = 1500;
							return view.goTo(options.target);
						}
					});
					this.mapView.ui.add(locate, "top-left");

					controller.addPoint(GraphicsLayer, Graphic);
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
				pageBusy: false
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
			this.initializeMap('streets', 'mapContainer', [138.608640, -35.042099], 15);
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
		addPoint(GraphicsLayer, Graphic) {
			const graphicsLayer = new GraphicsLayer();
			graphicsLayer.on("click", () => {
				console.log('Point Clicked');
			});
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
				symbol: simpleMarkerSymbol,
				attributes: {
					OrderNumber: '100032569',
					type: 'Order'
				}
			});
			graphicsLayer.add(pointGraphic);
		},
		/**
		 * Method opens an action sheet for the object type
		 */
		async openActionSheet(attributes) {
			const viewModel = this.getView().getModel("viewModel");

			if (this.orderInfoPopupContent) {
				this.openOrderPopup(this.orderInfoPopupContent);
				return;
			}

			viewModel.setProperty("/pageBusy", true);
			const orderInfoPopupContent = await sap.ui.core.Fragment.load({
				type: "XML",
				name: "FieldMobility.view.fragments.OrderInfo",
				controller: this
			});

			viewModel.setProperty("/pageBusy", false);
			this.orderInfoPopupContent = orderInfoPopupContent;
			this.getView().addDependent(this.orderInfoPopupContent);
			this.openOrderPopup(this.orderInfoPopupContent);


		},
		openOrderPopup(content) {
			if(window.nsWebViewInterface) {
				this.nativeScriptOpenBottomSheet();
				return;
			}
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
				url: 'https://www.google.com'
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