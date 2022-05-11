const { Emprunt, User, Contrat, Annonce } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { Op } = require("sequelize");

const listPret = async (req,res,next) =>{
    VerifyToken(req,res,next)
    
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {

        const listPrt = await Emprunt.findAll({
            where: {
                idContributeur: {                         
                    [Op.eq]: user.id,   
                }
            },
            include : [User, Contrat, Annonce]
        })

        return res.status(200).json({'success': listPrt})   
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({'error':'Erreur interne'})   
    }
}

module.exports = { listPret }