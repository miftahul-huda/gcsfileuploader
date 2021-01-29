## GCS Fileuploader


This is a backend service to upload files to GCP.

**API**

1. To get all the objects in specific folder;

    GET /uploader/gcs-list/:project/:bucket/:folder

**project:** the GCP project id
**bucket:** Bucket name
**folder:** the folder where you want to get the object list from

2. To upload the file

POST  /upload/gcs/:project/:bucket/:folder

**project:** the GCP project id
**bucket:** Bucket name
**folder:** the folder where you want to get the object list from

The post should be in the FORM data, with "file" as the file input variable.


**Prerequisite**

Install Node JS and NPM.

**Download**

You can download using git:

    git clone https://github.com/miftahul-huda/buma-component-rating-backend.git

**Install**

Go to "component-rating-backend" folder. Run:

    npm install

**Configuration**

This uses port 8080 to connect and PostgreSQL. To configure the PostgreSQL connection, open with text editor the file "initialization.js".

Modify this codes:

    const  sequelize  =  new  Sequelize('gcsfileuploader',  '<dbusername>',  '<dbpassword>',  {
    host:  '<dbhost>',
    dialect:  'postgres'
    });

**Run Locally**

To run locally, just type in the console in the root folder of this application:

    node app.js

**Deploy in App Engine**

To deploy to App Engine first you have to login first to GCP using command:

    gcloud auth login

Make sure you logged in using username who can access the GCP environment.

After login, deploy the application in app engine:

    gcloud app deploy

Once done, open the link that displayed in the output of the deploy command.

