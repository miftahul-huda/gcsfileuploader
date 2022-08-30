const axios = require('axios');
const ConfigLogic = require('./configlogic')


class SessionLogic 
{

    static test()
    {
        console.log("test")
    }

    static checkSession(sessionId)
    {
        var promise = new Promise((resolve, reject) => {

            SessionLogic.getAllConfig().then(function (configs){
                let config = SessionLogic.searchConfig(configs, "AUTHENTICATION_HOST")
                let authUrl = config.value + "/user/session/" + sessionId;
                axios.get(authUrl)
                .then(response => {
                    console.log("checksession");
                    console.log(response.data);
                    resolve( { success: true, message: '', payload: response.data.payload });
                })
                .catch(error => {
                    console.log(error);
                    reject( { success: false, message: error.message, error: error });
                });
            })


        });

        return promise;

    }

    static getAllConfig()
    {
      let keyValues  = [];
      let promise = new Promise((resolve, reject) => {
        ConfigLogic.findAll().then(function (response){
          resolve(response.payload);
        }).catch(function (error){
          reject(error)
        });
      })
    
      return promise;
    
    }
    
    static searchConfig(configs, key)
    {
        var config = {};
        for(var i =0; i <configs.length; i++)
        {
            if(configs[i].key == key)
                return configs[i];
        }
    
        return config;
    }
}


module.exports = SessionLogic;