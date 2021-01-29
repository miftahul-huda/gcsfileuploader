const ConfigModel  = require( './modules/models/configmodel')


const { Sequelize, Model, DataTypes } = require('sequelize');


const sequelize = new Sequelize('gcsfileuploader', '<dbuser>', '<dbpassword>', {
    host: '<dbhost>',
    dialect: 'postgres'
});
  

class Initialization {
    static async initializeDatabase(){

        let force = false;

        ConfigModel.initialize(sequelize, false);

        await sequelize.sync();

    }
}

module.exports = Initialization



