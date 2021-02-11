  

##  GCS Fileuploader

  
  

This is a backend service to upload files to GCP.

**API**

1. To get all the objects in specific folder;

    GET /upload/gcs-list/:project/:bucket/:folder
    
    **project:**
    the GCP project id
    
    **bucket:**
    Bucket name
    
    **folder:**
    the folder where you want to get the object list from

2. To upload the file

  
    POST /upload/gcs/:project/:bucket/:folder
    
    **project:**
    
    the GCP project id
    
    **bucket:**
    
    Bucket name
    
    **folder:**
    
    the folder where you want to get the object list from

  

The post should be in the FORM data, with "file" as the file input variable.

  
  

**Prerequisite**

  

Install Node JS and NPM.

  

**Download**

  

You can download using git:

  

    git clone https://github.com/miftahul-huda/gcsfileuploader.git

**Install**

Go to "component-rating-backend" folder. Run:

    npm install

**Configuration**

  

This uses port 8080 to connect and PostgreSQL. To configure the PostgreSQL connection in App Engine, create app.yaml file with this code:

    service:  gcsfileuploader-v2
    runtime:  nodejs12
    env:  standard
    env_variables:
	    PORT:  "8080"
	    DBHOST:  "<IP ADDRESS>"
	    DBNAME:  "gcsfileuploader"
	    DBUSER:  "<dbuser>"
	    DBPASSWORD:  "<dbpassword>"
    vpc_access_connector:
	    name:  projects/mind-id-mct-dev/locations/asia-southeast2/connectors/app-engine-cloudsql

**Run Locally**
To run locally, just type in the console in the root folder of this application:

    PORT=8080 DBHOST=<dbhost> DBNAME=<dbname> DBUSER=<dbuser> DBPASSWORD=<dbpassword> node app.js

**Deploy in App Engine**


To deploy to App Engine first you have to login first to GCP using command:

    gcloud auth login

Make sure you logged in using username who can access the GCP environment.
After login, deploy the application in app engine:

    gcloud app deploy

Once done, open the link that displayed in the output of the deploy command.