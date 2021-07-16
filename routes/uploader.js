var express = require('express');
var formidable = require('express-formidable')
var router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
// require modules
const fs = require('fs');
const archiver = require('archiver');
const ConfigLogic = require('../modules/logic/configlogic')
const UploadLogic = require('../modules/logic/uploadlogic')
let UploadedFileModel = require("../modules/models/uploadedfilemodel")

const {Storage} = require('@google-cloud/storage');
let ok = false;

const Formatter = require("../modules/util/formatter")
/* RESIZE OPTIMIZE IMAGES */
const Jimp = require('jimp');

let globalStorage = null;
let globalBucket = null;

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
      //cacheControl: 'public, max-age=31536000',
      cacheControl: 'no-cache',
    },
  }, function(err){
    console.log(filename + " uploadFileToGcs.done ")
    console.log(err);
  });



  console.log(`${filename} uploaded to ${bucketName}/${gcsfilename}.`);
  return "gs://" + bucketName + "/" + filename;
}


router.post('/gcs/view/:project/:uri', (req, res) => {
  let uri = req.params.uri;
  let url = uri.replace("gs://","");
  let paths = url.split("/");
  let project = req.params.project;

  getConfig("GCS_CREDENTIAL").then(async function (response){
    let credential = response.value;
    let downloadedfile = "/tmp/" + path.basename(file.name);

    console.log("downloadedfile")
    console.log(downloadedfile)
    await gcs_download_file(projectName, bucketName, file.name,  downloadedfile)
    
    console.log("jimp")
    const image = await Jimp.read(downloadedfile );
    await image.resize(100, Jimp.AUTO);
    await image.quality(70);
    await image.writeAsync(downloadedfile);
  });

});

router.get('/gcs/download/:project/:bucket/:path', (req, res) => {

  console.log("Params download ")
  console.log(req.params)
  let project = req.params.project;
  let bucket = req.params.bucket;
  let filepath = req.params.path;


  getConfig("GCS_CREDENTIAL").then(async function (response){
    let credential = response.value;
    let downloadedfile = "/tmp/" + path.basename(filepath);

    console.log("downloadedfile")
    console.log(downloadedfile)

    await gcs_download_file(project, bucket, filepath,  downloadedfile).catch((err)=>
    {
      res.send({ success: false, message: err });
    });
    
    res.download(downloadedfile)
  });

});

router.get('/gcs/download-folder/:project/:bucket/:folder', (req, res) => {

  console.log("Params 1");
  console.log(req.params);
  download_folder(req, res);

});

router.get('/gcs/download-folder/:project/:bucket/:folder/:zipfilename', (req, res) => {

  console.log("Params 2");
  console.log(req.params);
  download_folder(req, res);

});


function download_folder(req, res)
{
  console.log("Download folder")
  let projectName = req.params.project;
  let bucketName = req.params.bucket;
  let gcsFolder = req.params.folder;

  let zipFilename = req.params.zipfilename;

  if(gcsFolder == "*")
    gcsFolder = null;

  let outputZipFile = "result.zip";

  if(zipFilename != null)
    outputZipFile = zipFilename;
  else
  {
    if(gcsFolder != null)
    {
      let ff = gcsFolder.split("/");
      ff = ff[ff.length - 1];
      outputZipFile = ff + ".zip";
    }
  }


  getConfig("GCS_CREDENTIAL").then(async function (response){
    let credential = response.value;

    if(credential == "")
      credential = null;

  
    getListOfObject(credential, projectName, bucketName, gcsFolder).then(function (files){
      
      let totalFiles = getTotalFiles(files);
      let counter = 0;
      files.forEach(async (file, idx)=>{

        if(file.name.endsWith("/")  == false)
        {
          let downloadedfile = "/tmp/" + path.basename(file.name);
          await gcs_download_file(projectName, bucketName, file.name,  downloadedfile, credential).then(()=>{
            console.log("dsadfa " + counter + " --- " + totalFiles)
            if(counter == totalFiles - 1)
            {
              console.log("Zip Files");
              let tempZipFile = "/tmp/temporary-" + makeid(6) + ".zip";
              zipFiles(files, tempZipFile, function()
              {
                res.contentType('zip');

                res.download(tempZipFile, outputZipFile, function(err){
                  fs.unlink(tempZipFile, function(){});
                });
              }, function (err)
              {
                  res.send({ success: false, message: err })
              })
            }

            counter++;
          }).catch((err)=>
          {
            res.send({ success: false, message: err });
          });
        }
      })
    })
  });

}

router.get('/gcs/zip-folder/:project/:bucket/:folder/:outputbucket/:outputpath', (req, res) => {

  console.log("here")
  let projectName = req.params.project;
  let bucketName = req.params.bucket;
  let gcsFolder = req.params.folder;
  let outputpath = req.params.outputpath;
  let outputBucket = req.params.outputbucket;

  if(gcsFolder == "*")
    gcsFolder = null;


  getConfig("GCS_CREDENTIAL").then(async function (response){
    let credential = response.value;

    if(credential == "")
      credential = null;
  
    console.log(projectName + " - " + bucketName + " - " + gcsFolder + " - " + outputpath)
    getListOfObject(credential, projectName, bucketName, gcsFolder).then(function (files){
      console.log(files)
      let totalFiles = getTotalFiles(files);
      let counter = 0;
      files.forEach(async (file, idx)=>{
        console.log(file);

        if(file.name.endsWith("/")  == false)
        {
          let downloadedfile = "/tmp/" + path.basename(file.name);
          await gcs_download_file(projectName, bucketName, file.name,  downloadedfile, credential).then(()=>{
            console.log("dsadfa " + counter + " --- " + totalFiles)
            if(counter == totalFiles - 1)
            {
              console.log("Zip Files");
              let zipFilename = gcsFolder.split("/");
              zipFilename = zipFilename[zipFilename.length - 1];

              zipFilename = "/tmp/" + zipFilename + ".zip";

              zipFiles(files, zipFilename, function()
              {
                console.log(outputpath);
                
                uploadFileToGcs(credential, projectName, outputBucket, outputpath, zipFilename).then((result)=>{
                  fs.unlink(zipFilename, function(){});
                  res.send({ success: true, payload: "gs://" + outputBucket + "/" + outputpath });
                })
              })
            }

            counter++;
          }).catch((err)=>
          {
            res.send({ success: false, message: err });
          });
        }
      })
    })
  });

});

function getTotalFiles(files)
{
  let counter = 0;
  files.forEach((file)  => {
    if(file.name.endsWith("/") == false)
      counter++;
  })

  return counter;
}

function zipFiles(files, outputFile, callback, callbackError)
{
       console.log("Zipping files ")
      // create a file to stream archive data to.
      const output = fs.createWriteStream(outputFile);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        files.forEach((file)=>{
          let downloadedfile = "/tmp/" + path.basename(file.name);
          console.log("Deleting file " + downloadedfile)
          fs.unlink(downloadedfile, function(){})
        })

        if(callback != null)
          callback();
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', function() {
        console.log('Data has been drained');
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          if(callbackError != null)
            callbackError(err);
        }
      });

      // good practice to catch this error explicitly
      archive.on('error', function(err) {
        if(callbackError != null)
          callbackError(err);
      });

      // pipe archive data to the file
      archive.pipe(output);

      files.forEach((file)=>{

        if(file.name.endsWith("/") == false)
        {
          let downloadedfile = "/tmp/" + path.basename(file.name);

          console.log("Archiving " + downloadedfile);
          archive.append(fs.createReadStream(downloadedfile), { name: path.basename(file.name) });

        }
      })

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
      archive.finalize();
}

router.post('/gcs/:project/:bucket/:folder', formidable({
	  uploadDir: '/tmp'
  }), (req, res) => {

    let originalFilename = req.files.file.name;
    let ext = originalFilename.split('.');
    ext = ext[ext.length - 1];
  
    //let jsonData = require('../config.json');
  
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
      filetypes = filetypes.toLowerCase();

      console.log("filetypes");
      console.log(filetypes);

      console.log("ext");
      console.log(ext);

      filetypes = filetypes.split(',');
      if(filetypes.includes(ext.toLowerCase()))
      {
        getConfig("GCS_CREDENTIAL").then(async function (response){
          let credential = response.value;
      
          console.log("credential");
          console.log(credential);
      
          if(credential == "")
            credential = null;
        
          let appSession = req.session;
          //appSession.project = projectName;
          //appSession.bucket = bucketName;
          //appSession.folder = gcsFolder;

          /*
          const image = await Jimp.read(inputFile);
          await image.resize(800, Jimp.AUTO);
          await image.quality(80);
          await image.writeAsync(inputFile);
          */
        
          uploadFileToGcs(credential, projectName, bucketName, outputFilename, inputFile).then(async function (res){

            //fs.unlinkSync(req.files.file.path);

          })

          let uri = "gs://" + bucketName + "/" + outputFilename;
          res.header('Content-Type', 'application/json');
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
    }
  return result;
}

router.post('/gcs-create-file/:project/:bucket/:filepath', express.json({type: '*/*'}), (req, res) => {

  console.log("sdfasdfas")
  let content = req.body.content;
  console.log(content)
  let project = req.params.project;
  let bucket = req.params.bucket;
  let filepath = req.params.filepath;

  getConfig("GCS_CREDENTIAL").then(function (response){
    let credential = response.value;
    let filename = "/tmp/" + makeid(10) + ".tmp";
    fs.writeFile(filename, content, function(err){
      //f
      console.log("filename");
      console.log(filename);
      if(err)
        res.send({ success: false, message: err });
      else
      {
        console.log("uploadFileToGcs");
        fs.readFile(filename, 'utf8', (err, data) =>{
          console.log(filename);
          console.log(data)
        })
        uploadFileToGcs(credential, project, bucket, filepath, filename ).then(()=>{
          //fs.unlink( filename, function(){});
          res.send({ success: true, payload: filepath })
        }).catch(()=>{
          res.send({ success: false, payload: filepath })
        })
        
      }
    });
  });

})

router.post('/gcs-create-image/:project/:bucket/:filepath', express.json({type: '*/*', limit: '300mb'}), (req, res) => {

  console.log("sdfasdfas")
  let content = req.body.content;
  console.log(content)
  let ext = "png";
  if(content.indexOf("jpeg") > -1 || content.indexOf("jpg") > -1)
    ext = "jpg";

  content = content.replace(/^data:image\/png;base64,/, "")
  content = content.replace(/^data:image\/jpeg;base64,/, "")
  
  let project = req.params.project;
  let bucket = req.params.bucket;
  let filepath = req.params.filepath;

  getConfig("GCS_CREDENTIAL").then(function (response){
    let credential = response.value;
    let filename = "/tmp/" + makeid(10) + ".tmp";
    fs.writeFile(filename, content, function(err){
      //f
      console.log("filename");
      console.log(filename);
      if(err)
        res.send({ success: false, message: err });
      else
      {
        console.log("uploadFileToGcs");

        uploadFileToGcs(credential, project, bucket, filepath, filename ).then(()=>{
          //fs.unlink( filename, function(){});
          res.send({ success: true, payload: filepath })
        }).catch(()=>{
          res.send({ success: false, payload: filepath })
        })
        
      }
    });
  });

})



router.get('/gcs-list-public/:project/:bucket/:folder', (req, res) => {
    
  let projectName = req.params.project;
  let gcsFolder = req.params.folder;
  let bucketName = req.params.bucket;


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
  
})

router.get('/gcs-list-public/:project/:bucket', (req, res) => {
    
  let projectName = req.params.project;
  let bucketName = req.params.bucket;
  getConfig("GCS_CREDENTIAL").then(function (response){
    let credential = response.value;

    console.log("credential");
    console.log(credential);

    if(credential == "")
      credential = null;

  
    getListOfObject(credential, projectName, bucketName, null).then(function (files){
      let o = { success: true, payload:  files }
      res.setHeader('Content-Type', 'application/json');
      //o = Formatter.removeXSS(o);
      res.send(o);
    })
  });
})

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

router.get('/gcs-create-thumbnail/:project/:bucket/:file', (req, res) => {
    
    let projectName = req.params.project;
    let inputFile = req.params.file;
    let bucketName = req.params.bucket;
    /*
    let projectName = appSession.project;
    let gcsFolder = req.params.folder;
    let bucketName = appSession.bucket;
  */
    getConfig("GCS_CREDENTIAL").then(async function (response){
      let credential = response.value;

      console.log("credential");
      console.log(credential);

      if(credential == "")
        credential = null;

      let baseFilename = path.basename(inputFile);
      let basePath = inputFile.replace(baseFilename, "");
      let outputFilename = basePath + "thumbnail_" + baseFilename;

      console.log("Bucket : " + bucketName + ", File : " + inputFile);

      const image = await Jimp.read("https://storage.googleapis.com/" + bucketName + "/" + inputFile);
      await image.resize(300, Jimp.AUTO);
      await image.quality(60);
      await image.writeAsync("/tmp/" + baseFilename);

      uploadFileToGcs(credential, projectName, bucketName, outputFilename, "/tmp/" + baseFilename).then(async function (result){
        //fs.unlinkSync(req.files.file.path);
        let uri = "gs://" + bucketName + "/" + outputFilename;
        res.setHeader('Content-Type', 'application/json');
        let o = { success: true, payload: uri }
        //o = Formatter.removeXSS(o);
        res.send(o);
      })




    });
})

function gcs_download_file(projectId, bucketName, sourcepath, targetPath, credential=null)
{

  console.log("downloading " + bucketName + "/" + sourcepath)

  let promise = new Promise( async (resolve, reject)=>{

    let ext = path.extname(sourcepath);
    let file = null;


    if(credential != null)
      globalStorage = new Storage({ project: projectId, keyFilename: credential });
    else
      globalStorage = new Storage();
    

    globalBucket = globalStorage.bucket(bucketName); 
    
    file = globalBucket.file(sourcepath);
  
    //-
    // Download a file to a local destination.
    //-
    await file.download({
      destination: targetPath
    }).then((res)=>{
      console.log("Download done")
      resolve(res);
    }).catch(err => {
      reject(err);
    })
  })

  return promise;

}

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

router.get("/gcs/create-folder/:project/:bucket/:folder", (req, res) => {
  let project = req.params.project;
  let bucket = req.params.bucket;
  let folder = req.params.folder;

  getConfig("GCS_CREDENTIAL").then(function (response){
    let credential = response.value;

    console.log("credential");
    console.log(credential);

    if(credential == "")
      credential = null;

    createFolder(credential, project, bucket, folder).then((response)=>{
      res.send({ success: true, payload: response });
    }).catch((err)=>{
      console.log(err);
      res.send({ success: false, payload: err });
    })

  });

});

async function getListOfObject(credential, projectId, bucketName, folder)
{
  var storage = null;

  if(credential != null)
    storage = new Storage({ project: projectId, keyFilename: credential });
  else
    storage = new Storage();

  
  
  const options = {
  };

  if(folder != null)
    options.prefix = folder;

    // Lists files in the bucket, filtered by a prefix
    const [files] = await storage.bucket(bucketName).getFiles(options);

    return files;
}

async function createFolder(credential,  projectId, bucketName, folder)
{
  var storage = null;

  if(credential != null)
    storage = new Storage({ project: projectId, keyFilename: credential });
  else
    storage = new Storage();

  fs.writeFileSync("/tmp/README", folder)
  
  return storage.bucket(bucketName).upload("/tmp/README", { destination: folder + "/README" } )
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