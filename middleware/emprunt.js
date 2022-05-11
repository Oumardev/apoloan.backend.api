const { Pret, User, Contrat, Annonce } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { Op } = require("sequelize");

const listEmprunt = async (req,res,next) =>{
    VerifyToken(req,res,next)
    
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {

        const listEmpr = await Pret.findAll({
            where: {
                idDemandeur: {                         
                    [Op.eq]: user.id,   
                }
            },
            include : [User, Contrat, Annonce]
        })

        return res.status(200).json({'success': listEmpr})   
        
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})   
    }
}

module.exports = { listEmprunt }