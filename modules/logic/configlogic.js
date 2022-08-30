const ConfigModel  = require( '../models/configmodel')
const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/uploader.sqlite'
});

class ConfigLogic {

    static async create(config)
    {
        let result = this.validateCreate(config);
        if(result.success){
            try {
                let newconfig = await ConfigModel.create(config);
                result.payload = newconfig;
                return  result;
            }
            catch(error)
            {
                throw { success: false, message: '', error: error };
            }
            
        }
        else
        {
            throw result
        }

    }

    static async findAll()
    {
        try{
            let configs  = await ConfigModel.findAll();
            return { success: true, payload: configs }
        }
        catch (error)
        {
            console.log(error)
            throw { success: false, message: '', error: error };
        }
    }

    static async findByKey(key)
    {
        var config = {};
        try{
            let configs  = await ConfigModel.findAll({
                where: {
                        key: { [Op.like] : '%' + key + '%' }
                }
            })

            if(configs.length > 0)
                config = configs[0];

            return { success: true, payload: config }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async findByKeyword(search)
    {
        try{
            let configs  = await ConfigModel.findAll({
                where: {
                    [Op.or] : [
                        {name: { [Op.like] : '%' + search + '%' }},
                        {key: { [Op.like] : '%' + search + '%' }}
                    ]

                }
            })
            return { success: true, payload: configs }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async get(id)
    {
        try{
            let config  = await ConfigModel.findByPk(id);

            return { success: true, payload: config }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async updateByKey(key, value)
    {
        try {
            let newConfig = await ConfigModel.update( { value: value }, { where: { key: key} } );
            return { success: true, payload: newConfig };
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async update(id,  config)
    {
        let result = this.validate(config);
        if(result.success){
            try {
                let newconfig = await ConfigModel.update(config, { where:  { id: id }  });
                result.payload = newconfig;
                return  result;
            }
            catch(error)
            {
                throw { success: false, message: '', error: error };
            }
            
        }
        else
        {
            throw result
        }

    }

    static async delete(id)
    {
        try{
            let result  = await ConfigModel.destroy({ 
                where: {
                    id: id
                }
            });
 
            return { success: true, payload: result }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static validateCreate(config){
        
        return this.validate(config);
    }

    static validate(config)
    {   
        return {success :  true, message: "Succesfull"}
    }
}

module.exports = ConfigLogic;