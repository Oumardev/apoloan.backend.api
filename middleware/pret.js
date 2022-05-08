const { Pret, Annonce, Emprunt } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { createContrat } = require('./contrat')

const createPret = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    const { idAnnonce } = req.body

    if(!idAnnonce) return res.status(401).json({'message':'Erreur interne'})

    try {
        const annonce = await Annonce.findOne({where : {'id': idAnnonce}})
        if(!annonce) return res.status(401).json({'message': "Cette annonce n'est pas valide"})

        const contrat = await createContrat(req,res,next)
        const idContrat = contrat.dataValues.id

        const pret = await Pret.create({'idDemandeur': user.id, 'idAnnonce' : idAnnonce, 'idContrat' : idContrat, 'statut' : 'en_cour'})
        if(!pret) return res.status(401).json({'message':'Erreur interne',error})

        return res.status(200).json({'pret ':pret})

        } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})
    }
    
}

const listPret = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    try {

        const listPrt = await Emprunt.findAll({
            where: {
                idContributeur: {                         
                    [Op.eq]: user.id,   
                }
            }
        })

        return res.status(200).json({'ListPret ': listPrt})   
        
    } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})   
    }
}

const patchPret = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const { idAnnonce, duree, pourcentage, montant } = req.body

    try {
        const annonce = await Annonce.findOne({where : {'id': idAnnonce}})
        if(!annonce) return res.status(401).json({'message': "Cette annonce n'est pas valide"})

        annonce.duree = duree
        annonce.pourcentage = pourcentage
        annonce.montant = montant

        await annonce.save()

        return res.status(200).json({'Annonce modifié ': annonce})   
        
    } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})   
    }
}

module.exports = { createPret, listPret }