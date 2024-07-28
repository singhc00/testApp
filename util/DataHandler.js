sap.ui.define([
  "FieldMobility/util/platform/NativeScriptDataHelper",
  "FieldMobility/util/platform/WebDataHelper"
], function(NativeScriptDataHelper, WebDataHelper) {
  return {
    /**
     * Read any Rest service
     * Param : {
     *  path: '',
     *  headers: {}
     * }
     * @param {object} options 
     */
    readRestService(options) {
      return new Promise((resolve, reject) => {
        if(window.nsWebViewInterface) {
          NativeScriptDataHelper.readRestService(options)
          .then(resolve)
          .catch(reject);
        } else {
          WebDataHelper.readRestService(options)
          .then(resolve)
          .catch(reject);
        }
      })
      
    }
  }
});