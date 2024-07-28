sap.ui.define([
], function() {
  return {
    readRestService(options) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'GET',
                url: options.url,
                headers: options.headers, 
                success: resolve,
                error: reject
            });
        });
    }
  }
});