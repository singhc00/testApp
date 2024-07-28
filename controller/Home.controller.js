sap.ui.define(
  [
    "FieldMobility/controller/BaseController",
    "sap/ui/core/Popup",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "FieldMobility/util/DataHandler",
    "sap/m/MessageBox"
  ],
  function (Controller, Popup, Button, VBox, Fragment, JSONModel, DataHandler, MessageBox) {
    "use strict";

    return Controller.extend("FieldMobility.controller.Home", {
      async initializeMap(baseMapName, mapDivId, centerPoint, zoomLevel) {
        
        const component = this.getOwnerComponent();
        this.map = new component.arcgis.Map({
          basemap: baseMapName,
        });

        try {
          const token = await this.getArcgisToken();
          this.addTokenInterceptor(token);

          this.addOrdersLayerToMap();
        } catch(e) {
          MessageBox.error("There was error adding the orders layer. " + ( e.message ? e.message : ""));
        }
        

        this.mapView = new component.arcgis.MapView({
          map: this.map,
          center: centerPoint, // Longitude, latitude
          zoom: zoomLevel, // Zoom level
          container: mapDivId, //, // Div element
          //   constraints: {
          //     lods: TileInfo.create().lods,
          //   },
        });

        this.mapView.on("click", async (event) => {
          debugger;
          await this.getArcGisCred();
          this.mapViewClicked(event);
        });


        const locate = new component.arcgis.Locate({
          view: this.mapView,
          useHeadingEnabled: false,
          goToOverride: function (view, options) {
            options.target.scale = 1500;
            return view.goTo(options.target);
          },
        });
        this.mapView.ui.add(locate, "top-left");
        this.addPoints();
        this.addSketch();
      },
      /**
       * Add Order layer to Map
       */
      addOrdersLayerToMap() {
        const component = this.getOwnerComponent();
        const baseMapLayer = new component.arcgis.FeatureLayer({
          url: "https://geodev.utilities.etsa.net.au/server/rest/services/FieldMobility/FieldMobilityPOCWorkOrders/MapServer",
        });
        this.map.add(baseMapLayer, 0);
      },

      /**
       * Add token interceptor
       */
      addTokenInterceptor(token) {
        const component = this.getOwnerComponent();
        component.arcgis.esriConfig.request.interceptors.push({
          // set the `urls` property to the URL of the FeatureLayer so that this
          // interceptor only applies to requests made to the FeatureLayer URL
          urls: "https://geodev.utilities.etsa.net.au/server/rest/services/FieldMobility/FieldMobilityPOCWorkOrders/MapServer",
          // use the BeforeInterceptorCallback to add token to query
          before: function (params) {
            params.requestOptions.query = params.requestOptions.query || {};
            params.requestOptions.query.token = token;
          },
        });
      },
      async onInit() {
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
          submitVisible: window.nsWebViewInterface ? true : false,
        });
      },
      /**
       * Sets ESRI Map configuration
       */
      setEsriMapConfiguration() {
        const oGeoMap = this.byId("vbi2");
        var oMapConfig = {
          MapProvider: [
            {
              name: "ESRI",
              tileX: "256",
              tileY: "256",
              Source: [
                {
                  id: "s1",
                  //"url": "https://ibasemaps-api.arcgis.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tilemap/13/3264/1376/32/32?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
                  //"url": "/arcgis/MapServer?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
                  //"url": "/arcgis/MapServer/tile/13/3272/1393?token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL",
                  url: "https://ibasemaps-api.arcgis.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/13/3272/1393?token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL",
                  //"url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=json&token=AAPK0844337409204e97adf6606573bb4065LG2XsG7ErJOEo7kuicBPdesFgnbH7g7eDTxIwQQ_sxv2AJeklp_TEoJl4Uzf3BLL"
                },
              ],
            },
          ],
          MapLayerStacks: [
            {
              name: "DEFAULT",
              MapLayer: {
                name: "layer1",
                refMapProvider: "ESRI",
                opacity: "1",
                colBkgnd: "RGB(255,255,255)",
              },
            },
          ],
        };

        oGeoMap.setMapConfiguration(oMapConfig);
        oGeoMap.setRefMapLayerStack("DEFAULT");
      },
      onAfterRendering() {
        this.initializeMap(
          "gray",
          "mapContainer",
          [138.6426785237267, -34.931300004484065],
          17
        ).then(() => {});
        //arcgis/topographic
        //this.initializeMap("gray", "mapContainer", [138.60864, -35.042099], 17);
        //this.initializeMap('streets', 'mapContainer', [-118.818984489994, 34.0137559967283], 15);
        //[-118.818984489994, 34.0137559967283]
      },
      mapViewClicked(event) {
        this.mapView.hitTest(event.screenPoint).then((response) => {
          console.log(response);
          if (response.results && response.results.length > 0) {
            if (!response.results[0].graphic.symbol) {
              return;
            }

            this.setPointSelected(response.results[0].graphic);
            this.setCurrentOrderInfo(response.results[0].graphic.attributes);
            this.openActionSheet({
              offsetX: event.native.offsetX,
              offsetY: event.native.offsetY,
              srcElement: event.native.srcElement,
            });
          }
        });
      },
      /**
       * Sets the clicked order info to the global model
       */
      setCurrentOrderInfo(attributes) {
        if (!attributes || !attributes.OrderNumber) {
          return;
        }

        const globalModel = this.getView().getModel("globalModel");
        globalModel.setProperty("/currentOrderInfo", attributes);
      },

      async setPointSelected(graphic) {
        const clonedGraphic = graphic.clone();
        const markerBase64 = await this.getMarkerBase64("marker-black.png");
        clonedGraphic.symbol.set("url", markerBase64);

        graphic.layer.add(clonedGraphic);
        graphic.layer.remove(graphic);
        this.selectedPoint = clonedGraphic;
      },
      async setPointDeselected() {
        const clonedGraphic = this.selectedPoint.clone();
        const markerBase64 = await this.getMarkerBase64("marker-white.png");
        clonedGraphic.symbol.set("url", markerBase64);
        this.selectedPoint.layer.add(clonedGraphic);
        //this.selectedPoint.layer.remove(this.selectedPoint);
        //this.selectedPoint = null;
      },
      addPoints() {
        const points = [
          {
            type: "point",
            longitude: 138.62232002545724,
            latitude: -35.0459875724086,
            attributes: {
              OrderNumber: "10032564",
              Description: "Stobie Pole down",
            },
          },
          {
            type: "point",
            longitude: 138.60864,
            latitude: -35.042099,
            attributes: {
              OrderNumber: "100345111",
              Description: "Transformer damaged",
            },
          },
          {
            type: "point",
            longitude: 138.60963268949928,
            latitude: -35.04388314436227,
            attributes: {
              OrderNumber: "100385214",
              Description: "Powerline damaged",
            },
          },
          {
            type: "point",
            longitude: 138.6114911884523,
            latitude: -35.04375019098281,
            attributes: {
              OrderNumber: "100352144",
              Description: "Electric Shock",
            },
          },
        ];

        for (const point of points) {
          this.addPoint(point);
        }
      },

      /**
       * Add point to the map
       * @param {*} GraphicsLayer
       * @param {*} Graphic
       */
      async addPoint(point) {
		const component = this.getOwnerComponent();
        if (!this.pointsGraphicsLayer) {
          this.pointsGraphicsLayer = new component.arcgis.GraphicsLayer();
          this.pointsGraphicsLayer.on("click", () => {
            console.log("Point Clicked");
          });
          this.map.add(this.pointsGraphicsLayer);
        }

        let simpleMarkerSymbol = {
          type: "simple-marker",
          color: [226, 119, 40], // Orange
          outline: {
            color: [255, 255, 255], // White
            width: 1,
          },
        };

        const markerBase64 = await this.getMarkerBase64("marker-white.png");
        simpleMarkerSymbol = {
          type: "picture-marker",
          contentType: "image/png",
          url: markerBase64,
          width: "50px",
          height: "50px",
        };

        const pointGraphic = new component.arcgis.Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol,
          attributes: point.attributes,
        });

        if (!this.pointGraphics) {
          this.pointGraphics = [];
        }
        this.pointGraphics.push(pointGraphic);

        this.pointsGraphicsLayer.add(pointGraphic);
      },
      /**
       * Adds a feature layer
       */
      addFeatureLayer(FeatureLayer) {
        //Trailheads feature layer (points)
        const trailsLayer = new FeatureLayer({
          url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
        });

        this.map.add(trailsLayer, 0);
      },
      /**
       * Method opens an action sheet for the object type
       */
      async openActionSheet(offset) {
        const viewModel = this.getView().getModel("viewModel");

        if (window.nsWebViewInterface) {
          this.nativeScriptOpenBottomSheet();
          return;
        }
        this.openOrderDialog(offset);
      },
      async openOrderDialog(offset) {
        if (!this.jobDetailsDialog) {
          const jobDetailsDialog = await sap.ui.core.Fragment.load({
            type: "XML",
            name: "FieldMobility.view.fragments.JobDetailsPopover",
            controller: this,
          });
          this.jobDetailsDialog = jobDetailsDialog;

          this.getView().addDependent(this.jobDetailsDialog);

          this.jobDetailsDialog.attachBeforeClose(() => {
            this.setPointDeselected();
          });
        }

        if (this.jobDetailsDialog.isA("sap.m.ResponsivePopover")) {
          this.jobDetailsDialog.setOffsetX(20);
          this.jobDetailsDialog.setOffsetY(50);
        }

        const contentDiv = document.getElementById("mapPopover");

        this.jobDetailsDialog.openBy(contentDiv);
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
        popup.open(
          0,
          sap.ui.core.Popup.Dock.CenterBottom,
          sap.ui.core.Popup.Dock.CenterBottom,
          document
        );
      },
      /**
       * Opens nativescript bottom sheet
       */
      nativeScriptOpenBottomSheet() {
        window.nsWebViewInterface.emit("showBottomSheet", {
          url: "",
          hash: "jobDetails",
        });

        window.nsWebViewInterface.on("bottomSheetClosed", () => {
          this.setPointDeselected();
        });
      },
      bottomPopupAfterRendering() {
        debugger;
        const gesuredZone = this.getDomRef();
        var touchstartX = 0;
        var touchstartY = 0;
        var touchendX = 0;
        var touchendY = 0;
        const handleGesure = function () {
          var swiped = "swiped: ";
          if (touchendX < touchstartX) {
            console.log(swiped + "left!");
          }
          if (touchendX > touchstartX) {
            console.log(swiped + "right!");
          }
          if (touchendY < touchstartY) {
            console.log(swiped + "down!");
          }
          if (touchendY > touchstartY) {
            console.log(swiped + "left!");
          }
          if (touchendY == touchstartY) {
            console.log("tap!");
          }
        };
        gesuredZone.addEventListener(
          "touchstart",
          function (event) {
            touchstartX = event.screenX;
            touchstartY = event.screenY;
          },
          false
        );

        gesuredZone.addEventListener(
          "touchend",
          function (event) {
            touchendX = event.screenX;
            touchendY = event.screenY;
            handleGesure();
          },
          false
        );
      },
      /**
       * Add sketch using esri sketch wizard
       */
      addSketch() {
		const component = this.getOwnerComponent();
        const sketch = new component.arcgis.Sketch({
          view: this.mapView,
        });
        this.mapView.ui.add(sketch, "bottom-left");
      },
      /**
       * Get ArcGis Token
       * Needs to be moved to backend once the firewall rules are configured
       */
      async getArcgisToken() {
        const baseUri = this.getOwnerComponent().getBaseUri();
        const cred = await this.getArcGisCred();
        const token = await this.getArcgisAuthToken(cred);
        const tokenJSON = JSON.parse(token);
        return tokenJSON.token;
      },
      /**
       * Gets the credentials
       * @returns
       */
      getArcGisCred() {
        return DataHandler.readRestService({
          url: '/arcgis/cred'
        });
        return new Promise((resolve, reject) => {
          $.ajax({
            url: "/arcgis/cred",
            success: resolve,
            error: reject,
          });
        });
      },
      /**
       * Get the auth token for arcgis
       */
      getArcgisAuthToken(cred) {
        return new Promise((resolve, reject) => {
          const tokenUrl =
            "https://geodev.utilities.etsa.net.au/portal/sharing/rest/generateToken?f=pjson";
          $.ajax({
            method: "POST",
            url: tokenUrl,
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            data: {
              username: cred.user,
              password: cred.pass,
              referer: "FieldMobilityPoC",
            },
            success: resolve,
            error: reject,
          });
        });
      },
      getMarkerBase64(marker) {
        return new Promise((resolve, reject) => {
          const path = "images/" + marker;
          $.ajax({
            url: path,
            beforeSend: function (xhr) {
              xhr.overrideMimeType("text/plain; charset=x-user-defined");
            },
            success: (result, textStatus, response) => {
              var responseText = response.responseText;
              var responseTextLen = responseText.length;
              let binary = "";
              for (let i = 0; i < responseTextLen; i++) {
                binary += String.fromCharCode(responseText.charCodeAt(i) & 255);
              }
              //
              resolve(`data:image/png;base64, ${btoa(binary)}`);
            },
            error: reject,
          });
        });
      },
    });
  }
);
