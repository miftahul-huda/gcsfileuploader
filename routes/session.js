var express = require('express');
var router = express.Router();
const path = require('path');

const SessionLogic = require('../modules/logic/sessionlogic')


router.get('/callback', function (req, res){
  let sessionId = req.query.session;
  let appSession = req.session;
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
})


module.exports = router;
