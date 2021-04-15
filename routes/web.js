var express = require('express');
var router = express.Router();
const path = require('path');

const SessionLogic = require('../modules/logic/sessionlogic')
const ConfigLogic = require('../modules/logic/configlogic')

router.get("/config", function(req, res){
    var appSession = req.session;

    getAllConfig().then(function(configs){
        var AUTH_HOST = searchConfig(configs, "AUTHENTICATION_HOST" ).value;
        var GCS_PROJECT = searchConfig(configs, "GCS_PROJECT" ).value;
        var loginUrl = AUTH_HOST + "/web/login";
    
        if(appSession == null || appSession.user == null)
            res.redirect(loginUrl)
        else
        {
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "configuration");
            var option = { app_logo: process.env.APP_LOGO, app_title: process.env.APP_TITLE }
            res.render(p, { session:  appSession, option: option} )    
        }
    }).catch(function(error){
        console.log(error);
    })

});

router.get('', function (req, res){
    var appSession = req.session;
    
    getAllConfig().then(function(configs){

        console.log("======CONFIGS=======")
        console.log(configs);

        var AUTH_HOST = searchConfig(configs, "AUTHENTICATION_HOST" ).value;
        var GCS_PROJECT = searchConfig(configs, "GCS_PROJECT" ).value;
        var GCS_FOLDER_LEVEL = searchConfig(configs, "GCS_FOLDER_LEVEL" ).value;
        var GCS_FOLDER_TITLES = searchConfig(configs, "GCS_FOLDER_TITLES" ).value;
        var GCS_BUCKET = searchConfig(configs, "GCS_BUCKET" ).value;
        if(GCS_FOLDER_LEVEL == null)
            GCS_FOLDER_LEVEL = 2;

        var loginUrl = AUTH_HOST + "/web/login";
        if(GCS_BUCKET != null)
            appSession.bucket = GCS_BUCKET;
        else
            appSession.bucket = appSession.orginfo;
        appSession.project = GCS_PROJECT;
        appSession.totalFolderLevel = GCS_FOLDER_LEVEL;
        appSession.folderTitles = GCS_FOLDER_TITLES;
    
        //SessionLogic.checkSession(appSession.sessionID).then(function (result)
        //{
        
            
            if((appSession.user != null && appSession.user.length > 0))
            {
                var dir = __dirname;
                console.log(appSession.user);
                var p = path.resolve( dir, "../public/pages/", "uploader");
                var option = { app_logo: process.env.APP_LOGO, app_title: process.env.APP_TITLE }
                res.render(p, { session:  appSession, sessionJson: JSON.stringify(appSession) , option: option} )
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
        var GCS_FOLDER_LEVEL = searchConfig(configs, "GCS_FOLDER_LEVEL" ).value;
        var GCS_FOLDER_TITLES = searchConfig(configs, "GCS_FOLDER_TITLES" ).value;
        var GCS_BUCKET = searchConfig(configs, "GCS_BUCKET" ).value;
        if(GCS_FOLDER_LEVEL == null)
            GCS_FOLDER_LEVEL = 2;

        var loginUrl = AUTH_HOST + "/web/login";
        if(GCS_BUCKET != null)
            appSession.bucket = GCS_BUCKET;
        else
            appSession.bucket = appSession.orginfo;

        appSession.project = GCS_PROJECT;
        appSession.totalFolderLevel = GCS_FOLDER_LEVEL;
        appSession.folderTitles = GCS_FOLDER_TITLES;

        console.log("GCS_FOLDER_LEVEL")
        console.log(appSession.totalFolderLevel);
    
        //SessionLogic.checkSession(appSession.sessionID).then(function (result)
        //{
        
            
            if((appSession.user != null && appSession.user.length > 0) || pass == 1)
            {
    
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "uploader");
                var option = { app_logo: process.env.APP_LOGO, app_title: process.env.APP_TITLE }
                res.render(p, { session:  appSession, sessionJson: JSON.stringify(appSession), option: option} )
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