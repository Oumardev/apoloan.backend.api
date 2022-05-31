const { Annonce, User } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { Op } = require("sequelize");

const createAnnonce = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    console.log('body req',req.body)
    const { type, duree, pourcentage, modalitePaiement, montant } = req.body  //  type:['EMPRUNT','PRET'] 

    if( !type || !duree || !pourcentage || !modalitePaiement || !montant ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    if( type.replace(/\s/g, '')=='') return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})
     
    // vérifie si numéro contient des letttres
    if (!Number.isInteger(montant)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})
    
   // insertion de l'annonce

   try {
       const annonce = await Annonce.create({
            'type': type, 
            'duree': duree, 
            'modalitePaiement': modalitePaiement ,
            'pourcentage': pourcentage, 
            'montant': montant, 
            'isBooster':false, 
            'isVisible': true, 
            'codeUser': user.id
        })

        if(!annonce) return res.status(401).json({'error':'Erreur interne',error})
        
       return res.status(200).json({'success':'Annonce crée'})
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})
   }
}

const listAnnonce = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {
        const listPret = await Annonce.findAll({
            where: {
                codeUser: {                         
                    [Op.ne]: user.id,   
                },
                isVisible:{
                    [Op.eq] : true
                },
                type:{
                    [Op.eq] : 'PRET'
                }
            },
            include: User
        })

        const listEmprunt = await Annonce.findAll({
            where: {
                codeUser: {                         
                    [Op.ne]: user.id,   
                },
                isVisible:{
                    [Op.eq] : true
                },
                type:{
                    [Op.eq] : 'EMPRUNT'
                }
            },
            include: User
        })

        return res.status(200).json({'pret': listPret, 'emprunt': listEmprunt})   
        
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})   
    }
}

const patchAnnonce = async (req,res,next) =>{
    VerifyToken(req,res,next)
    
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const { idAnnonce, duree, pourcentage, montant } = req.body

    if( !idAnnonce || !duree || !pourcentage || !montant ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    if( duree.replace(/\s/g, '')=='' ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})
     
    // vérifie si numéro contient des letttres
    if (!Number.isInteger(montant)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})

    try {
        const annonce = await Annonce.findOne({where : {'id': idAnnonce}})
        if(!annonce) return res.status(401).json({'error': "Cette annonce n'est pas valide"})

        annonce.duree = duree
        annonce.pourcentage = pourcentage
        annonce.montant = montant

        await annonce.save()

        return res.status(200).json({'success': annonce})   
        
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})   
    }
}

const deleteAnnonce = async (req,res,next) =>{
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const { idAnnonce } = req.body    

    try {
        const anndel = await Annonce.destroy({where : {id : idAnnonce}})
        if(!anndel) return res.status(401).json({'error':'Erreur interne'})

        return res.status(200).json({'success':'Annonce supprimé'})   
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})      
    }

}

module.exports = { createAnnonce , listAnnonce, patchAnnonce , deleteAnnonce }