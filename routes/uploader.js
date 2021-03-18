var express = require('express');
var router = express.Router();
const path = require('path');
var fs = require('fs');
const ConfigLogic = require('../modules/logic/configlogic')
const UploadLogic = require('../modules/logic/uploadlogic')
let UploadedFileModel = require("../modules/models/uploadedfilemodel")

const {Storage} = require('@google-cloud/storage');
let ok = false;

const Formatter = require("../modules/util/formatter")




function getConfig(key)
{
  let promise = new Promise((resolve, reject) => {
    ConfigLogic.findByKey(key).then(function (response){
      resolve(response.payload);
    }).catch(function (error){
      reject(error)
    });

  })


  return promise;

}

async function uploadFileToGcs(credential, projectId, bucketName, gcsfilename, filename) {
  // Creates a client
  var storage = null;

  if(credential != null)
    storage = new Storage({ project: projectId, keyFilename: credential });
  else
    storage = new Storage();
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: false,
    destination: gcsfilename,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'public, max-age=31536000',
    },
  });

  console.log(`${filename} uploaded to ${bucketName}.`);
  return "gs://" + bucketName + "/" + filename;
}

router.post('/gcs/:project/:bucket/:folder', (req, res) => {

    let originalFilename = req.files.file.name;
    let ext = originalFilename.split('.');
    ext = ext[ext.length - 1];
  
    let jsonData = require('../config.json');
  
    let projectName = req.params.project;
    let gcsFolder = req.params.folder;

    
    let bucketName = req.params.bucket;
    let user = req.query.user;
    let orgname = req.query.orgname;
  
    let inputFile = req.files.file.path;
    let outputFilename = originalFilename;
  
    outputFilename = gcsFolder + '/' + outputFilename;

    getConfig("GCS_FILETYPES").then(function (response){
      let filetypes = response.value;
      console.log("filetypes");
      console.log(filetypes);

      console.log("ext");
      console.log(ext);

      filetypes = filetypes.split(',');
      if(filetypes.includes(ext))
      {
        getConfig("GCS_CREDENTIAL").then(function (response){
          let credential = response.value;
      
          console.log("credential");
          console.log(credential);
      
          if(credential == "")
            credential = null;
        
          let appSession = req.session;
          //appSession.project = projectName;
          //appSession.bucket = bucketName;
          //appSession.folder = gcsFolder;
        
          uploadFileToGcs(credential, projectName, bucketName, outputFilename, inputFile).then(function (res){

            let uploadedfile = {
              company: orgname,
              folder: gcsFolder,
              filename: outputFilename,
              username: user,
              transfered: 0
            };
            UploadedFileModel.create(uploadedfile);

            fs.unlinkSync(req.files.file.path);


          })

          let uri = "gs://" + bucketName + "/" + outputFilename;
          res.setHeader('Content-Type', 'application/json');
          let o = { success: true, payload: uri }
          //o = Formatter.removeXSS(o);
          res.send(o);

        });

      }
      else {
        res.setHeader('Content-Type', 'application/json');
        let o = { success: false, message: 'File type \'' + ext + '\' is not allowed' }
        o = Formatter.removeXSS(o);
        res.send(o);
      }

    });
  

  
})

router.get('/gcs/folders', (req, res) => {
  getConfig("GCS_FOLDER_STRUCTURE").then(function (response){
    var gcsfolder = response.value;
    let o = { success: true, payload:  gcsfolder }
    res.setHeader('Content-Type', 'application/json');
    //o = Formatter.removeXSS(o);
    res.send(o);    
  });
});

router.get('/gcs-list/:project/:bucket/:folder', (req, res) => {

  let appSession = req.session;

  if(appSession == null || appSession.user == null)
    res.send({ success: false, message: "Not Allowed" } )
  else
  {
    /*
    let projectName = req.params.project;
    let gcsFolder = req.params.folder;
    let bucketName = req.params.bucket;
    */
    let projectName = appSession.project;
    let gcsFolder = req.params.folder;
    let bucketName = appSession.bucket;

    getConfig("GCS_CREDENTIAL").then(function (response){
      let credential = response.value;

      console.log("credential");
      console.log(credential);

      if(credential == "")
        credential = null;

    
      getListOfObject(credential, projectName, bucketName, gcsFolder).then(function (files){
        let o = { success: true, payload:  files }
        res.setHeader('Content-Type', 'application/json');
        //o = Formatter.removeXSS(o);
        res.send(o);
      })

    });
  }
})

router.get('/gcs-delete/:project/:bucket/:files', (req, res) => {

  let projectName = req.params.project;
  let gcsFiles = req.params.files;
  let bucketName = req.params.bucket;

  getConfig("GCS_CREDENTIAL").then(function (response){
    let credential = response.value;

    console.log("credential");
    console.log(credential);

    if(credential == "")
      credential = null;

    var filenames = gcsFiles.split(';');

    deleteFiles(credential, projectName, bucketName, filenames).then(function (result){
      let o = { success: true, payload:  result }
      res.setHeader('Content-Type', 'application/json');
      //o = Formatter.removeXSS(o);
      res.send(o);
    })
  });
})

router.get("/transfered/:transfered", (req, res) => {
  let transfered = req.params.transfered;
  UploadLogic.findByTransfered(transfered).then(function (uploadedfiles)
  {
    res.send(uploadedfiles);
  }).catch(function (err){
    console.log("error")
    console.log(err);
    res.send(err);
  })
});

router.get("/transfered/update/:ids/:transfered", (req, res) => {
  let transfered = req.params.transfered;
  let ids = req.params.ids;
  ids = ids.split(',');
  UploadLogic.updateTransferedByIds( ids, transfered).then(function (uploadedfiles)
  {
    res.send(uploadedfiles);
  }).catch(function (err){
    console.log("error")
    console.log(err);
    res.send(err);
  })
});

async function getListOfObject(credential, projectId, bucketName, folder)
{
  var storage = null;

  if(credential != null)
    storage = new Storage({ project: projectId, keyFilename: credential });
  else
    storage = new Storage();
    const options = {
      prefix: folder,
    };

    // Lists files in the bucket, filtered by a prefix
    const [files] = await storage.bucket(bucketName).getFiles(options);

    return files;
}

async function deleteFiles(credential,  projectId, bucketName, files)
{
  var storage = null;
  var errors = [];
  var successes = [];

  if(credential != null)
    storage = new Storage({ project: projectId, keyFilename: credential });
  else
    storage = new Storage();

  var promise = new Promise((resolve, reject)=>{
    var bucket = storage.bucket(bucketName);
    console.log(files);
    for(var i = 0; i < files.length;i++)
    {
      var filename = files[i];
      console.log("here")
      console.log(filename);
      try {
        deleteFile(bucket, filename);
        console.log(filename)
        successes.push(filename);
      }
      catch (e)
      {
        console.log(e);
        errors.push(e);
      }
      
    } 
    
    resolve({ success: successes, failures: errors })
  })

  return promise;

}

async function deleteFile(bucket, filename)
{
  await bucket.file(filename).delete();
  return filename;
}

module.exports = router;