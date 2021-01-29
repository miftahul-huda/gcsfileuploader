var express = require('express');
var router = express.Router();

const LogLogic = require('../modules/logic/loglogic')


router.post('/create', function (req, res){
  let log = req.body;
  log.logDate = new Date();

  LogLogic.create(log).then(function (savedLog)
  {
    res.send(savedLog);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/', function (req, res){

  LogLogic.findAll().then(function (logs)
  {
    res.send(logs);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.post('/', function (req, res){
  let search = req.body;

  LogLogic.findAll(search).then(function (savedLog)
  {
    res.send(savedLog);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/get/:id', function (req, res){
  let id = req.params.id;

  LogLogic.get(id).then(function (log)
  {
    res.send(log);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.post('/update/:id', function (req, res){
  let log = req.body;
  let id = req.params.id;

  LogLogic.update(id, log).then(function (savedLog)
  {
    res.send(savedLog);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/delete/:id', function (req, res){
  let id = req.params.id;

  LogLogic.delete(id, log).then(function (result)
  {
    res.send(result);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

module.exports = router;
