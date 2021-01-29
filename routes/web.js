var express = require('express');
var router = express.Router();
const path = require('path');

const SessionLogic = require('../modules/logic/sessionlogic')
const ConfigLogic = require('../modules/logic/configlogic')

router.get("/config", function(req, res){
    var appSession = req.session;
    var dir = __dirname;
    var p = path.resolve( dir, "../public/pages/", "configuration");
    res.render(p, { session:  appSession} )    
});

router.get('', function (req, res){
    var appSession = req.session;
    
    getAllConfig().then(function(configs){

        console.log("======CONFIGS=======")
        console.log(configs);

        var AUTH_HOST = searchConfig(configs, "AUTHENTICATION_HOST" ).value;
        var GCS_PROJECT = searchConfig(configs, "GCS_PROJECT" ).value;
        var loginUrl = AUTH_HOST + "/web/login";
        appSession.bucket = appSession.orginfo;
        appSession.project = GCS_PROJECT;
    
        //SessionLogic.checkSession(appSession.sessionID).then(function (result)
        //{
        
            
            if((appSession.user != null && appSession.user.length > 0))
            {
    
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "uploader");
                res.render(p, { session:  appSession} )
            }
            else 
            {
                res.redirect(loginUrl)
            }
    
        /*}).catch(function (error)
        {
            console.log(error)
            res.redirect(loginUrl)
        })*/
    }).catch(function (error){
        console.log(error);
    });
})

router.get('/pass', function (req, res){
    var appSession = req.session;
    var pass = 1;
    
    getAllConfig().then(function(configs){

        console.log("======CONFIGS=======")
        console.log(configs);

        var AUTH_HOST = searchConfig(configs, "AUTHENTICATION_HOST" ).value;
        var GCS_PROJECT = searchConfig(configs, "GCS_PROJECT" ).value;
        var loginUrl = AUTH_HOST + "/web/login";
        appSession.bucket = appSession.orginfo;
        appSession.project = GCS_PROJECT;
    
        //SessionLogic.checkSession(appSession.sessionID).then(function (result)
        //{
        
            
            if((appSession.user != null && appSession.user.length > 0) || pass == 1)
            {
    
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "uploader");
                res.render(p, { session:  appSession} )
            }
            else 
            {
                res.redirect(loginUrl)
            }
    
        /*}).catch(function (error)
        {
            console.log(error)
            res.redirect(loginUrl)
        })*/
    }).catch(function (error){
        console.log(error);
    });
})

function getAllConfig()
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

function searchConfig(configs, key)
{
    var config = {};
    for(var i =0; i <configs.length; i++)
    {
        if(configs[i].key == key)
            return configs[i];
    }

    return config;
}







module.exports = router;