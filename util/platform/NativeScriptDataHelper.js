sap.ui.define([
    
], function() {
  return {
    readRestService(options) {
        return new Promise((resolve, reject) => {
            const requestOptions = options;
            const uniqueId = crypto.randomUUID();
            requestOptions.uniqueId = uniqueId;
            //if(!window.nsFieldMobilityRestServiceEventRegistered) {
              window.nsWebViewInterface.on('restService', (responseOptions) => {
                if(responseOptions.uniqueId === uniqueId) {
                  //alert(JSON.stringify(responseOptions));
                    resolve(JSON.parse(responseOptions.response.data), responseOptions.response.headers);
                }
              }); 
              window.nsFieldMobilityRestServiceEventRegistered = true;
            //}
            
            
            window.nsWebViewInterface.emit('restService', requestOptions);
            
        });
        
    }
  }
});