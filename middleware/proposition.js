const { User, Annonce, Contrat, Proposition } = require('../models')
const { VerifyToken } = require('./verifyToken')

const listProposition = async (req,res,next) =>{
    const { IDANNONCE } = req.body 
    if(!IDANNONCE) return res.status(401).json({'error':'Erreur interne'})

    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {
        const annonce = await Annonce.findOne({where : {id : IDANNONCE}})
        if(!annonce) return res.status(401).json({'error':'Cette annonce n\'est pas valide'})

        const proposition = await Proposition.findAll({
            where:{
                idAnnonce : IDANNONCE
            },
            include : [User, Contrat, Annonce]
        })
        if(!proposition) return res.status(401).json({'error':'Aucune proposition pour cette annonce'})

        return res.status(200).json({'success': proposition})   
    } catch (error) {
        console.log(error)
        return res.status(401).json({'error':'Erreur interne'})   
    }
}

module.exports = { listProposition }