const { Annonce, User } = require('../models')
const { VerifyToken } = require('./verifyToken')
const { Op } = require("sequelize");

const generatePercent = (duree,payment,montant)=>{
    var PERCENT = 0
    
    if(montant <= 100000) PERCENT = 1.5
    if(montant>=100000 && montant <= 250000) PERCENT = 1.9
    if(montant>=250000 && montant <= 500000) PERCENT = 2.4
    if(montant>=500000 && montant <= 1000000) PERCENT = 3
    
    var perc_duree = (duree/12)
    var perc_payment = (payment/4)
    
    var calc = (perc_duree*perc_payment) + PERCENT
    
    return calc
}

const createAnnonce = async (req,res,next) =>{
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const { type, duree, modalitePaiement, montant } = req.body  //  type:['EMPRUNT','PRET'] 

    if( !type || !duree || !modalitePaiement || !montant ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    if( type.replace(/\s/g, '')=='') return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})
     
    // vérifie si numéro contient des letttres
    if (!Number.isInteger(montant)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})
    
    // on génère le pourcentage 
    var pourcentage = generatePercent(duree,modalitePaiement,montant)

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
        const list = await Annonce.findAll({
            where: {
                codeUser: {                         
                    [Op.ne]: user.id,   
                },
                isVisible:{
                    [Op.eq] : true
                }
            },
            include: User
        })

        return res.status(200).json({'list': list,})   
        
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})   
    }
}

const listPost = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {
        const list = await Annonce.findAll({
            where: {
                codeUser: {                         
                    [Op.eq]: user.id,   
                }
            }
        })

        return res.status(200).json({'list': list,})   
        
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})   
    }
}

const patchAnnonce = async (req,res,next) =>{
    VerifyToken(req,res,next)
    
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const { idAnnonce, duree, modalitePaiement, montant } = req.body

    if( !idAnnonce || !duree || !modalitePaiement || !montant ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    if( duree.replace(/\s/g, '')=='' ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})
     
    // on génère le pourcentage 
    var pourcentage = generatePercent(duree,modalitePaiement,montant)

    // vérifie si numéro contient des letttres
    if (!Number.isInteger(montant)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})

    try {
        const annonce = await Annonce.findOne({where : {'id': idAnnonce}})
        if(!annonce) return res.status(401).json({'error': "Cette annonce n'est pas valide"})

        annonce.duree = duree
        annonce.modalitePaiement = modalitePaiement
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

module.exports = { createAnnonce , listAnnonce, patchAnnonce , deleteAnnonce, listPost }