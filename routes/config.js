var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

const ConfigLogic = require('../modules/logic/configlogic')


router.get('/create/:name/:key/:value', function (req, res){
  let config = {};

  config.name = req.params.name;
  config.key = req.params.key;
  config.value = req.params.value;

  console.log("config")
  console.log(config)

  ConfigLogic.create(config).then(function (savedConfig)
  {
    res.send(savedConfig);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('', function (req, res){

  ConfigLogic.findAll().then(function (configs)
  {
    res.send(configs);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.post('/', function (req, res){
  let search = req.body;

  ConfigLogic.findAll(search).then(function (savedConfig)
  {
    res.send(savedConfig);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/get/:id', function (req, res){
  let id = req.params.id;

  ConfigLogic.get(id).then(function (log)
  {
    res.send(log);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/key/:key', function (req, res){
  let key = req.params.key;

  ConfigLogic.findByKey(key).then(function (config)
  {
    res.send(config);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.post('/update/:id', function (req, res){
  let log = req.body;
  let id = req.params.id;

  ConfigLogic.update(id, log).then(function (savedConfig)
  {
    res.send(savedConfig);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

router.get('/update-by-key/:key/:value', function (req, res){
  let key = req.params.key;
  let value = req.params.value;
  console.log(key)
  console.log(value)

  var b = new Buffer(value, 'base64')
  var s = b.toString();

  console.log(s);

  ConfigLogic.updateByKey(key, s).then(function (savedConfig)
  {
    res.send(savedConfig);
  }).catch(function (err){
    console.log("error")
    console.log(err);
    res.send(err);
  })
})

router.get('/delete/:id', function (req, res){
  let id = req.params.id;

  ConfigLogic.delete(id).then(function (result)
  {
    res.send(result);
  }).catch(function (err){
    console.log("error")
    res.send(err);
  })
})

module.exports = router;
