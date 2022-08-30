const { Model, DataTypes } = require('sequelize');

class ConfigModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            key: DataTypes.STRING,
            value: DataTypes.TEXT,
            name: DataTypes.STRING,
            description: DataTypes.STRING
        }, 
        { sequelize, modelName: 'configuration', tableName: 'configuration', force: force });
    }
}

module.exports = ConfigModel;