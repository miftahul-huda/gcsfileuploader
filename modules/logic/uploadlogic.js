const UploadedFileModel  = require( '../models/uploadedfilemodel')
const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

class UploadLogic {
    static async create(uploadedfile)
    {
        let result = this.validateCreate(uploadedfile);
        if(result.success){
            try {
                let newuploadedfile = await UploadedFileModel.create(uploadedfile);
                result.payload = newuploadedfile;
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
            let uploadedfiles  = await UploadedFileModel.findAll();
            return { success: true, payload: uploadedfiles }
        }
        catch (error)
        {
            console.log(error)
            throw { success: false, message: '', error: error };
        }
    }

    static async findByTransfered(transfer)
    {
        var uploadedfile = {};
        try{
            let uploadedfiles  = await UploadedFileModel.findAll({
                where: {
                        transfered: transfer
                }
            })

            return { success: true, payload: uploadedfiles }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async findByKeyword(search)
    {
        try{
            let uploadedfiles  = await UploadedFileModel.findAll({
                where: {
                    [Op.or] : [
                        {company: { [Op.like] : '%' + search + '%' }},
                        {username: { [Op.like] : '%' + search + '%' }}
                    ]

                }
            })
            return { success: true, payload: uploadedfiles }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async get(id)
    {
        try{
            let uploadedfile  = await UploadedFileModel.findByPk(id);

            return { success: true, payload: uploadedfile }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async update(id,  uploadedfile)
    {
        let result = this.validate(uploadedfile);
        if(result.success){
            try {
                let newuploadedfile = await UploadedFileModel.update(uploadedfile, { where:  { id: id }  });
                result.payload = newuploadedfile;
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

    static async updateTransfered(id,  transfered)
    {

        try {
            let newuploadedfile = await UploadedFileModel.update({ transfered: transfered }, { where:  { id: id }  });
            result.payload = newuploadedfile;
            return  result;
        }
        catch(error)
        {
            throw { success: false, message: '', error: error };
        }

    }

    static async updateTransferedByIds(ids,  transfered)
    {
        console.log("IDS")
        console.log(ids);
        var result = {};
        try {
            let newuploadedfile = await UploadedFileModel.update({ transfered: transfered }, { where:  { id: { [Op.in]: ids  }}  });
            result.success = true;
            result.payload = newuploadedfile;
            return  result;
        }
        catch(error)
        {
            throw { success: false, message: '', error: error };
        }

    }

    static async delete(id)
    {
        try{
            let result  = await UploadedFileModel.destroy({ 
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

    static validateCreate(uploadedfile){
        
        return this.validate(uploadedfile);
    }

    static validate(uploadedfile)
    {   
        return {success :  true, message: "Succesfull"}
    }
}

module.exports = UploadLogic;