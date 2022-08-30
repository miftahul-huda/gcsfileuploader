var express = require('express');
var router = express.Router();
const path = require('path');
const axios = require('axios');

const SessionLogic = require('../modules/logic/sessionlogic')
const ConfigLogic = require('../modules/logic/configlogic')
const Formatter = require("../modules/util/formatter")


router.get('/callback', function (req, res){
  let sessionId = req.query.session;
  let appSession = req.session;



  getAllConfig().then(function(configs){
    var AUTH_HOST = searchConfig(configs, "AUTHENTICATION_HOST" ).value;
    var GCS_PROJECT = searchConfig(configs, "GCS_PROJECT" ).value;
    var checkSessionUrl = AUTH_HOST + "/user/session/" + sessionId;  
  
    // Make a request for a session with a given ID
    axios.get(checkSessionUrl)
    .then(function (response) {
      console.log(response);
      //response = JSON.parse(response)
      
      // handle success
      if(response.data.payload.valid)
      {
        let usr = response.data.payload.user;
        if(usr.email == req.query.user && usr.organization.orginfo == req.query.orginfo  && usr.organization.orgname.replace(/ /g) == req.query.orgname.replace(/ /g))
        {

          appSession.sessionID = sessionId;
          appSession.user = req.query.user;
          appSession.firstname = req.query.firstname;
          appSession.lastname = req.query.lastname;
          appSession.orgname = req.query.orgname;
          appSession.orginfo = req.query.orginfo;

          console.log(appSession);
  
          var dir = __dirname;
          var p = path.resolve( dir, "../public/pages/", "callback");
          res.render(p, { session: appSession } )
        }
        else {
          res.send("No such session " + JSON.stringify(sessionId) + " " + JSON.stringify(usr))
        }
      }
      else
      {
        res.send("No such session ")
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.send("Error : " + JSON.stringify(error));
    })


  })


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
