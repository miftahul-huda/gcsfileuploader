const ConfigModel  = require( './modules/models/configmodel')
const UploadedFileModel  = require( './modules/models/uploadedfilemodel')


const { Sequelize, Model, DataTypes } = require('sequelize');
/*const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/uploader.sqlite'
});*/


/*const sequelize = new Sequelize('gcsfileuploader', 'nodeuser', 'rotikeju98', {
    host: '/cloudsql/mind-id-mct-dev:asia-southeast2:authentication-uploader',
    dialect: 'postgres',
    dialectOptions: {
        socketPath: '/cloudsql/mind-id-mct-dev:asia-southeast2:authentication-uploader'
    }
  });*/

  const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: "postgresql"  
});

class Initialization {
    static async initializeDatabase(){

        let force = false;

        ConfigModel.initialize(sequelize, false);
        UploadedFileModel.initialize(sequelize, false);

        await sequelize.sync();

    }
}

module.exports = Initialization



