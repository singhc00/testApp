sap.ui.define([
    
], function() {
  return {
    readRestService(options) {
        return new Promise((resolve, reject) => {
            const requestOptions = options;
            const uniqueId = crypto.randomUUID();
            requestOptions.uniqueId = uniqueId;
            window.nsWebViewInterface.emit('restService', requestOptions);
            window.nsWebViewInterface.on('restService', (responseOptions) => {
                if(responseOptions.uniqueId === uniqueId) {
                    resolve(responseOptions.response.data, responseOptions.response.headers);
                }
            }); 
        });
        
    }
  }
});