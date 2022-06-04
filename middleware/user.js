const { User, Compte, Annonce, Contrat, Proposition, Transaction } = require('../models')
const { VerifyToken } = require('./verifyToken')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");

const getUser = async (req,res,next) =>{
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})

    const IDUSER = req.user.id

    try {
        const userFound = await User.findOne({where: {id: IDUSER}, include: Compte})
        if(!userFound) return res.status(400).json({'error' : 'Erreur interne'})
        return res.status(200).json({'user': userFound})   

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const getSignature = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    const IDUSER = req.user.id

    try {
        const userFound = await User.findOne({
            where: {id: IDUSER}, 
            attributes: ['id','signature'],
        })

        if(!userFound) return res.status(400).json({'error' : 'Erreur interne'})

        return res.status(200).json({'signature': userFound.signature })   

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur internse',error})
    }
}

const editUser = async (req,res,next) =>{
    const { nom, prenom, age, adresse, fonction } = req.body
    VerifyToken(req,res,next)
    const regex = /\d/;

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})

    const IDUSER = req.user.id

    if( !nom || !prenom || !age || !adresse || !fonction ) return res.status(400).json({'error' : 'Veuillez saisir tout les champs'})

    // vérifie si les chaines de caractères sont composées uniquement que d'espace
    if( nom.replace(/\s/g, '')=='' || prenom.replace(/\s/g, '')=='' || adresse.replace(/\s/g, '')=='' || fonction.replace(/\s/g, '')=='' ) return res.status(400).json({'error' : 'Veuillez saisir tout les champs'})

    // vérifie si le nom ou le prenom contiennent des chiffres
    if ( regex.test(nom) || regex.test(prenom) )  return res.status(400).json({'error' : 'Certaines informations ne doivent pas contenir des chiffres'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(400).json({'error' : 'Erreur interne'})

        userFound.nom = nom
        userFound.prenom = prenom
        userFound.age = age
        userFound.adresse = adresse
        userFound.fonction = fonction

        await userFound.save()
        return res.status(200).json({'Utilisateur modifié ': userFound})   

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const editPassword = async (req,res,next) =>{
    const { oldPassword ,newPassword } = req.body
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    const IDUSER = req.user.id

    if (newPassword.length < 8) return res.status(400).json({'error' : 'Le mot de passe doit contenir au moins 8 caractères'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(400).json({'error' : 'Erreur interne'})

        bcrypt.compare(userFound.password, oldPassword, (err, data)=>{
            if(err) return res.status(400).json({'error' : 'Erreur interne'})

            if(!data) return res.status(400).json({'error' : 'Votre mot de passe actuel n\'est pas valide'})

            bcrypt.hash(newPassword, 10, async (err, hashPassword)=>{
                if(err) return res.status(400).json({'error' : 'Erreur interne'})

                userFound.password = hashPassword
                await userFound.save()
                return res.status(200).json({'success' : 'Mot de passe modifié'}) 
            })

        })

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const refilUserAccount = async (req,res,next) =>{
    const { montant } = req.body
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    const IDUSER = req.user.id

    /**
     * ici seront les fonctions de vérification du solde de la carte bancaire 
     * en fonction du montant de rechargement demandé
     * pour l'instant nous nous contentons de recharger le solde directement a partir du montant demandé 
     * sans vérification
     */

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(400).json({'error' : 'Erreur interne'})

        const userAccount = await Compte.findOne({where: {id: userFound.idCompte}})
        if(!userAccount) return res.status(400).json({'error' : 'Le compte a une erreur'})

        userAccount.solde += montant

        await userAccount.save()
        return res.status(200).json({'Rechargement effectué: ' : userAccount})

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const genContrat = async(req,res,usr,annonce) =>{
    
    const user = req.user
    const data = { 'proposant':usr.dataValues, 'annonce': annonce }

    if(!user) return res.status(400).json({'error':'Erreur interne token invalide'})
    const linktoken = jwt.sign({data},process.env.SECRET_TOKEN_CONTRAT,{expiresIn : '2d'})

    return `/cosntr?urltemp=${linktoken}`
}

const toPropose = async (req,res,next) =>{
    /**
     * popup : L'orsque vous enregistrer une signature vos contrats serons signé automatiquement l'orsque vous faites une proposition
     */
    const { IDANNONCE } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
        // fx qui calcule la date d'échéance
        const makeDateEcheance = (anc) =>{
            var dateEcheance = new Date()
            dateEcheance.setMonth(dateEcheance.getMonth()+ anc.duree);
            return dateEcheance
        }

        // on recherche pour voir si l'uilisateur a enregistré une signature dans sa table
        const usr = await User.findOne({ where : { id : IDUSER } })
        let contrat = null
        if(!usr.signature) return res.status(400).json({'error':'Vous devez enregistrer une signature avant de commencer la suite de l\'opération'})
        
        // on recherche si user a déja proposé a cette annonce
        const propst = await Proposition.findOne({
            where: {
                [Op.and]: [{ idProposant: IDUSER }, { idAnnonce: IDANNONCE }]
            },
            include : [User, Contrat, Annonce]
        })
        if(propst) return res.status(400).json({'error':'Vous ne pouvez pas proposer sur cette annonce'})
        // on recherche le type de l'annonce 
        const annonce = await Annonce.findOne({where: {
            id : IDANNONCE
        }})            
        if(annonce.type == 'EMPRUNT'){
            // on génère le contrat 
            const docs = await genContrat(req,res,usr,annonce);

            contrat = await Contrat.create({
                document : docs,
                signatureCreantier : usr.signature,
                signatureDebiteur : null,
                dateEcheance : makeDateEcheance(annonce)
            })
        }else{
            // on génère le contrat 
            const docs = await genContrat(req,res,usr,annonce);

            contrat = await Contrat.create({
                document : docs,
                signatureCreantier : null,
                signatureDebiteur : usr.signature,
                dateEcheance : makeDateEcheance(annonce)
            })
        }

        // on créer la proposition
        const resc = await Proposition.create({
            idAnnonce:IDANNONCE, 
            idProposant:IDUSER, 
            idContrat : contrat.id,
            status: 'en attente' 
        })

        if(!resc) return res.status(400).json({'error':'Erreur interne'})
        return res.status(200).json({
            'message':'Votre proposition a été envoyé elle sera supprimé automatiquement si l\'utilisateur la rejette'
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({'error':'Erreur interne',})
    }
}

const deleteProposition = async (req,res,nest) =>{
    const { IDPROPOSITION } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    
    try {

        const prosdel = await Proposition.findOne({where : {id : IDPROPOSITION}})
        if(!prosdel) return res.status(400).json({'error':'Erreur interne'})

        const contrat = await Contrat.destroy({where : {id : prosdel.idContrat}})
        if(!contrat) return res.status(400).json({'error':'Erreur interne'})

        await prosdel.destroy()

        return res.status(200).json({'message':'La proposition a été supprimé'})
    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const resToPropose = async(req,res,next) =>{
    const { IDPROPOSANT ,IDANNONCE, RESPONSE } = req.body 
    const user = req.user
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...
    
    const makePaymentField = async (anc, trs)=> {
        var dteEche = new Date();
        var slicePayment = (anc.duree/anc.modalitePaiement);
        
        var montant = anc.montant / slicePayment
        var aVerser = Math.round((montant*0.16)+montant)
        
        for(i=0; i<slicePayment; i++){
            dteEche.setMonth(dteEche.getMonth()+ anc.modalitePaiement)
            const savePayment = await Versement.create({
                idTransaction: trs.id,
                vieme: i+1,
                vntotal: slicePayment,
                montantVerser: null,
                montantAVerser: aVerser,
                dateEcheance: dteEche
            })
            if(!savePayment) return res.status(400).json({'error':'Opération impossible'})
        }
    }

    try {
        const proposition = await Proposition.findOne({
                where: {
                    [Op.and]: [
                        { idAnnonce: IDANNONCE },
                        { idProposant: IDPROPOSANT }
                    ]
                }
            }
            )
        if(!proposition) return res.status(200).json({'error':'Opération impossible ou le contrat a été supprimé'})
        const idProposition = proposition.dataValues.id

        if(RESPONSE == 'rejeter'){
            const prosdel = await Proposition.destroy({where : {id : idProposition}})
            if(!prosdel) return res.status(200).json({'error':'Erreur interne'})

            return res.status(200).json({'error':'La proposition a été rejeté'})
        }

        if(RESPONSE == 'accepter'){
            
            // const prosdel = await Proposition.destroy({
            //     where: {
            //         [Op.and]: [
            //           { idAnnonce : proposition.idAnnonce },
            //           { 
            //             idProposant: {                         
            //                 [Op.not]: user.id,   
            //             } 
            //           }
            //         ]
            //     }
            // })
            // if(!prosdel) return res.status(200).json({'error':'Opération impossible'})
            
            const annonce = await Annonce.findOne({where: {
                id : proposition.idAnnonce
            }})
            annonce.isVisible = false;

            if(annonce.type == 'EMPRUNT'){
                // on débite le compte du contributeur et on crédite le compte de l'emprunteur
                const userContributeur = await User.findOne({
                    where: {id : proposition.idProposant },
                    include : [Compte]
                })
                const userEmprunteur = await User.findOne({
                    where: {id : IDUSER },
                    include : [Compte]
                })

                if(!userContributeur || !userEmprunteur) return res.status(200).json({'error':'Erreur interne'})
                
                // on vérifie le solde du contributeur
                if(userContributeur.Compte.solde < annonce.montant ) return res.status(200).json({'error' : 'Le contributeur ne dispose pas de fond disponible pour effectuer cette transaction'})

                // on crédite le compte de l'emprunteur et débite le compte du contributeur
                userEmprunteur.Compte.solde += annonce.montant
                userContributeur.solde -= annonce.montant

                await annonce.save()
                await userContributeur.save()
                await userEmprunteur.save()

                const saveTrs = await Transaction.create({
                    idContributeur : proposition.idProposant,
                    idEmprunteur : IDUSER,
                    idAnnonce : annonce.id,
                    idContrat : proposition.idContrat,
                    status : 'en cour'
                })
                if(!saveTrs) return res.status(200).json({'error':'Erreur interne'})

                // save payment
                await makePaymentField(annonce,saveTrs)

                const delprop = proposition.destroy({where : {idAnnonce : proposition.idAnnonce}})
                if(!delprop) return res.status(200).json({'error':'Opération impossible'})

                return res.status(200).json({'error':'Opération réussite'})
            }else{
                // on débite le compte du contributeur et on crédite le compte de l'emprunteur
                const userContributeur = await User.findOne({
                    where: {id : IDUSER },
                    include : [Compte]
                })
                const userEmprunteur = await User.findOne({where: 
                    {id : proposition.idProposant },
                    include : [Compte]
                })

                if(!userContributeur || !userEmprunteur) return res.status(200).json({'error':'Erreur interne'})
       
                // on vérifie le solde du contributeur
                if(userContributeur.dataValues.Compte.solde < annonce.montant ) return res.status(200).json({'error' : 'Impossible d\'effectuer cette transaction solde insuffisant'})

                // on crédite le compte de l'emprunteur et débite le compte du contributeur
                userEmprunteur.dataValues.Compte.solde += annonce.montant
                userContributeur.dataValues.solde -= annonce.montant

                await annonce.save()
                await userContributeur.save()
                await userEmprunteur.save()

                const saveTrs = await Transaction.create({
                    idContributeur : IDUSER,
                    idEmprunteur : proposition.idProposant,
                    idAnnonce : annonce.id,
                    idContrat : proposition.idContrat,
                    status : 'en cour'
                })
                if(!saveTrs) return res.status(200).json({'error':'Erreur interne'})

                // save payment
                await makePaymentField(annonce,saveTrs)

                const delprop = proposition.destroy({where : {idAnnonce : proposition.idAnnonce}})
                if(!delprop) return res.status(200).json({'error':'Opération impossible'})

                return res.status(200).json({'error':'Opération réussite'})
            }
        }

    } catch (error) {
        console.log('error: ',error)
        return res.status(200).json({'error':'Erreur interne'})
    }
}

const addSignature = async(req,res,next) =>{

    const user = req.user
    const { signature } = req.body
    console.log(user)
    
    if(!user) return res.status(400).json({'error':'Erreur interne token invalide'})

    try {
        const usr = await User.findOne({where : {id: user.id}})
        usr.signature = signature
        const sgn = await usr.save()

        if(!sgn) return res.status(400).json({'error':'Erreur interne token invalide'})
    
        return res.status(200).json({'message':'Votre signature a été enregsitré'})
    } catch (error) {
        return res.status(400).json({'error':'Erreur interne'})
    }

}

const showContrat = async (req,res,next) =>{
    const { IDCONTRAT } = req.body 

    if(!IDCONTRAT) return res.status(400).json({'error':'Erreur interne'})
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})

    try {
        const contrat = await Contrat.findOne({where : {id:IDCONTRAT}})
        if(!contrat) res.status(400).json({'error':'Ce contrat est introuvable'})    


        res.redirect(contrat.document);
    } catch (error) {
        return res.status(400).json({'error':'Erreur interne'})
    }
}

const makePayment = async (req,res,next) =>{
    const { IDTRANSACTION , VERSEMENT } = req.body
    VerifyToken(req,res,next)
    
    const user = req.user
    if(!user) return res.status(400).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
      

    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

module.exports = { getUser , editUser, editPassword, refilUserAccount, addSignature, getSignature, showContrat, toPropose, deleteProposition, resToPropose }