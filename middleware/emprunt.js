const { Emprunt, Annonce, Pret } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { createContrat } = require('./contrat')

const createEmprunt = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    const { idAnnonce } = req.body

    if(!idAnnonce) return res.status(401).json({'message':'Erreur interne'})

    try {
        const annonce = await Annonce.findOne({where : {'id': idAnnonce}})
        if(!annonce) return res.status(401).json({'message': "Cette annonce n'est pas valide"})

        const contrat = await createContrat(req,res,next)
        const idContrat = contrat.dataValues.id

        const emprunt = await Emprunt.create({'idContributeur': user.id, 'idAnnonce' : idAnnonce, 'idContrat' : idContrat, 'statut' : 'en_cour'})
        if(!emprunt) return res.status(401).json({'message':'Erreur interne',error})

        return res.status(200).json({'emprunt ':emprunt})

        } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})
    }
}

const listEmprunt = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    try {

        const listEmpr = await Pret.findAll({
            where: {
                idDemandeur: {                         
                    [Op.eq]: user.id,   
                }
            }
        })

        return res.status(200).json({'ListEmpr ': listEmpr})   
        
    } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})   
    }
}

module.exports = { createEmprunt , listEmprunt }