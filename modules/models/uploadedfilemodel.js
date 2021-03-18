const { Model, DataTypes } = require('sequelize');

class UploadedFileModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            company: DataTypes.STRING,
            folder: DataTypes.TEXT,
            filename: DataTypes.STRING,
            username: DataTypes.STRING,
            transfered: DataTypes.INTEGER
        }, 
        { sequelize, modelName: 'uploadedfile', tableName: 'uploadedfile', force: force });
    }
}

module.exports = UploadedFileModel;