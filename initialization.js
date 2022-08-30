const ConfigModel  = require( './modules/models/configmodel')
const UploadedFileModel  = require( './modules/models/uploadedfilemodel')


const { Sequelize, Model, DataTypes } = require('sequelize');



const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: process.env.DBENGINE,
    logging: false
});

/*
const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    dialect: 'postgresql',
    host: '/cloudsql/' + process.env.CLOUD_SQL_CONNECTION_NAME,
    dialectOptions: {
        socketPath: '/cloudsql/' + process.env.CLOUD_SQL_CONNECTION_NAME
  },
  });
*/
class Initialization {
    static async initializeDatabase(){

        let force = false;

        ConfigModel.initialize(sequelize, false);
        UploadedFileModel.initialize(sequelize, false);

        await sequelize.sync();

    }
}

module.exports = Initialization



