sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"FieldMobility/model/models",
	"FieldMobility/util/ArcGis"
], function (UIComponent, Device, models, ArcGis) {
	"use strict";

	return UIComponent.extend("FieldMobility.Component", {

		metadata: {
			manifest: "json"
		},
		arcgis: {}, // Set in class /util/ArcGis

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: async function () {
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			await this.loadArcgis();
			await ArcGis.loadArcGisObjects(this);
			
			// enable routing
			var oRouter = this.getRouter();
			if (oRouter) {
				oRouter.initialize();
			}
			
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createGlobalModel(), "globalModel");
		},
		
		loadArcgis() {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://js.arcgis.com/4.30/';
				script.onload = () => {
					resolve();
				}
				document.head.appendChild(script);
			});
		},
		getBaseUri() {
			return '';
		}
	});

});