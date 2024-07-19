jQuery.sap.registerModulePath('arcgis_server', 'https://js.arcgis.com/4.6/');

sap.ui.define([
  'arcgis_server/init',
], function() {
  return {
    require: require
  };
});