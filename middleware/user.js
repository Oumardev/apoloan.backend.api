const { User, Compte, Annonce, Emprunt, Contrat, Pret, Proposition, Transaction } = require('../models')
const { VerifyToken } = require('./verifyToken')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");

const getUser = async (req,res,next) =>{
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const IDUSER = req.user.id

    try {
        const userFound = await User.findOne({where: {id: IDUSER}, include: Compte})
        if(!userFound) return res.status(401).json({'error' : 'Erreur interne'})
        return res.status(200).json({'user': userFound})   

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

const getSignature = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id

    try {
        const userFound = await User.findOne({
            where: {id: IDUSER}, 
            attributes: ['id','signature'],
        })

        if(!userFound) return res.status(401).json({'error' : 'Erreur interne'})

        return res.status(200).json({'signature': userFound.signature })   

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur internse',error})
    }
}

const editUser = async (req,res,next) =>{
    const { nom, prenom, age, adresse, fonction } = req.body
    console.log(req.body)
    VerifyToken(req,res,next)
    const regex = /\d/;

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const IDUSER = req.user.id

    if( !nom || !prenom || !age || !adresse || !fonction ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    // vérifie si les chaines de caractères sont composées uniquement que d'espace
    if( nom.replace(/\s/g, '')=='' || prenom.replace(/\s/g, '')=='' || adresse.replace(/\s/g, '')=='' || fonction.replace(/\s/g, '')=='' ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    // vérifie si le nom ou le prenom contiennent des chiffres
    if ( regex.test(nom) || regex.test(prenom) )  return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des chiffres'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(401).json({'error' : 'Erreur interne'})

        userFound.nom = nom
        userFound.prenom = prenom
        userFound.age = age
        userFound.adresse = adresse
        userFound.fonction = fonction

        await userFound.save()
        return res.status(200).json({'Utilisateur modifié ': userFound})   

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

const editPassword = async (req,res,next) =>{
    const { oldPassword ,newPassword } = req.body
    console.log(req.body)
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id

    if (newPassword.length < 8) return res.status(401).json({'error' : 'Le mot de passe doit contenir au moins 8 caractères'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(401).json({'error' : 'Erreur interne'})

        bcrypt.compare(userFound.password, oldPassword, (err, data)=>{
            if(err) return res.status(401).json({'error' : 'Erreur interne'})

            if(!data) return res.status(401).json({'error' : 'Votre mot de passe actuel n\'est pas valide'})

            bcrypt.hash(newPassword, 10, async (err, hashPassword)=>{
                if(err) return res.status(401).json({'error' : 'Erreur interne'})

                userFound.password = hashPassword
                await userFound.save()
                return res.status(200).json({'success' : 'Mot de passe modifié'}) 
            })

        })

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

const refilUserAccount = async (req,res,next) =>{
    const { montant } = req.body
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
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

const genContrat = async(req,res) =>{

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne token invalide'})
    const linktoken = jwt.sign({user},process.env.SECRET_TOKEN_CONTRAT,{expiresIn : '2d'})

    return `/cosntr?urltemp=${linktoken}`
}

const toPropose = async (req,res,next) =>{
    /**
     * popup : L'orsque vous enregistrer une signature vos contrats serons signé automatiquement l'orsque vous faites une proposition
     */
    const { IDANNONCE } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
        // on recherche pour voir si l'uilisateur a enregistré une signature dans sa table
        const usr = await User.findOne({ id : IDUSER })
        let contrat = null
        if(!user.signature) return res.status(401).json({'error':'Vous devez enregistrer une signature avant de commencer la suite de l\'opération'})
        
        // on recherche si user a déja proposé a cette annonce
        const propst = await Proposition.findOne({
            where: {
                [Op.and]: [{ idProposant: IDUSER }, { idAnnonce: IDANNONCE }]
            }
        })
        if(propst) return res.status(401).json({'error':'Vous ne pouvez pas proposer sur cette annonce'})
        
        // on recherche le type de l'annonce 
        const annonce = await Annonce.findOne({where: {
            id : IDANNONCE
        }})            
        if(annonce.type == 'EMPRUNT'){
            // on génère le contrat 
            contrat = await Contrat.create({
                document : genContrat(req,res),
                signatureCreantier : user.signature,
                signatureDebiteur : null
            })
        }else{
            // on génère le contrat 
            contrat = await Contrat.create({
                document : genContrat(req,res),
                signatureCreantier : null,
                signatureDebiteur : user.signature
            })
        }

        // on créer la proposition
        const resc = await Proposition.create({
            idAnnonce:IDANNONCE, 
            idProposant:IDUSER, 
            idContrat : contrat.id,
            status: 'en attente' 
        })

        if(!resc) return res.status(401).json({'error':'Erreur interne'})
        return res.status(200).json({
            'message':'Votre proposition a été envoyé elle sera supprimé automatiquement si l\'utilisateur la rejette'
        })

    } catch (error) {
        return res.status(401).json({'error':'Erreur interne'})
    }
}

const deleteProposition = async (req,res,nest) =>{
    const { IDPROPOSITION } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    
    try {

        const prosdel = await Proposition.findOne({where : {id : IDPROPOSITION}})
        if(!prosdel) return res.status(401).json({'error':'Erreur interne'})

        const contrat = await Contrat.destroy({where : {id : prosdel.idContrat}})
        if(!contrat) return res.status(401).json({'error':'Erreur interne'})

        await prosdel.destroy()

        return res.status(200).json({'message':'La proposition a été supprimé'})
    } catch (error) {
        return res.status(400).json({'error' : 'Erreur interne'})
    }
}

const resToPropose = async(req,res,next) =>{
    const { IDPROPOSITION, RESPONSE } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
        const proposition = Proposition.findOne({where:{id: IDPROPOSITION}})
        if(!proposition) return res.status(401).json({'error':'Erreur interne'})
        //await proposition.save()

        if(RESPONSE == 'rejeter'){
            const prosdel = await Proposition.destroy({where : {id : IDPROPOSITION}})
            if(!prosdel) return res.status(401).json({'error':'Erreur interne'})

            return res.status(200).json({'message':'La proposition a été rejeté'})
        }

        if(RESPONSE == 'accepter'){
            const prosdel = await Proposition.destroy({
                where: {
                    [Op.and]: [
                      { idAnnonce : proposition.idAnnonce },
                      { 
                          id: {                         
                            [Op.not]: user.id,   
                        } 
                      }
                    ]
                }
            })
            if(!prosdel) return res.status(401).json({'error':'Erreur interne'})

            const annonce = await Annonce.findOne({where: {
                id : proposition.idAnnonce
            }})            
            if(annonce.type == 'EMPRUNT'){
                
                const saveProp = await Transaction.create({
                    idContributeur : IDUSER,
                    idEmprunteur : annonce.codeUser,
                    idAnnonce : annonce.id,
                    idContrat : proposition.idContrat,
                    status : 'en attende de signature ...'
                })
                if(!saveProp) return res.status(401).json({'error':'Erreur interne'})

                return res.status(200).json({'message':'Opération réussite, signer le contrat pour finaliser la transaction'})
            }else{
                const saveProp = await Transaction.create({
                    idContributeur : annonce.codeUser,
                    idEmprunteur : IDUSER,
                    idAnnonce : annonce.id,
                    status : 'en attende de signature ...'
                })

                return res.status(200).json({'message':'Opération réussite, signer le contrat pour finaliser la transaction'})
            }
        }

    } catch (error) {
        return res.status(401).json({'error':'Erreur interne'})
    }
}

const addSignature = async(req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user
    const { signature } = req.body

    if(!user) return res.status(401).json({'error':'Erreur interne token invalide'})

    try {
        const usr = await User.findOne({id: user.id})
        usr.signature = signature
        const sgn = await usr.save()
        if(!sgn) return res.status(401).json({'error':'Erreur interne token invalide'})
    
        return res.status(200).json({'message':'Votre signature a été enregsitré'})
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne'})
    }

}

const showContrat = async (req,res,next) =>{
    const { IDCONTRAT } = req.body 

    if(!IDCONTRAT) return res.status(401).json({'error':'Erreur interne'})
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    try {
        const contrat = await Contrat.findOne({where : {id:IDCONTRAT}})
        if(!contrat) res.status(401).json({'error':'Ce contrat est introuvable'})    

        res.redirect(contrat.document);
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne'})
    }
}

const debitUserAccount = async (req,res,next) =>{
    const { IDANNONCE } = req.body 
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
        // on recherche les informations sur l'annonce
        const annonceFound = await Annonce.findOne({where: {id: IDANNONCE}})
        if(!annonceFound) return res.status(401).json({'error' : 'Erreur interne'})

        if (annonceFound.type == 'EMPRUNT') {
            // si l'utilisateur en cour vois une annonce d'emprunt et qu'il veut donner de l'argent

            const senderUser = await User.findOne({where: {id: IDUSER}})
            if(!senderUser) return res.status(401).json({'error' : 'Erreur intesne'})
            const senderAccount = await Compte.findOne({where: {id: senderUser.idCompte}})
    
            // on vérifie si le solde disponible sur le compte de l'expéditeur est suffisant
            if(senderAccount.solde < annonceFound.montant ) return res.status(401).json({'error' : 'Impossible d\'effectuer cette transaction solde insuffisant'})
    
            // on crédite le compte du receveur
            const recipientUser = await User.findOne({where: {id: annonceFound.codeUser}})
            if(!recipientUser) return res.status(401).json({'error' : 'Erreur interne'})
            const recipientAccount = await Compte.findOne({where: {id: recipientUser.idCompte}})
    
            recipientAccount.solde += annonceFound.montant
            await recipientAccount.save()
    
            // on débite le compte de l'expéditeur
            senderAccount.solde -= annonceFound.montant
            await senderAccount.save()

            // on retire la visibilité de l'annonce
            annonceFound.isVisible = false 
            await annonceFound.save()

            // on créer un contrat
            const contratEmpt = await Contrat.create({'nom': uuid.v1()})

            // on enregistre l'emprunt
            await Pret.create({idDemandeur: annonceFound.codeUser, idAnnonce: annonceFound.id, idContrat : contratEmpt.id, statut : 'en cour'})

            // on enregistre le pret
            await Emprunt.create({idContributeur : IDUSER , idAnnonce: annonceFound.id, idContrat : contratEmpt.id, statut : 'en cour'})

            return res.status(200).json({'success': 'La transaction s\'est bien passé'})

        } else {
            // si l'utilisateur en cour vois une annonce de contribution et qu'il veut emprunter

            const senderUser = await User.findOne({where: {id: annonceFound.codeUser}})
            if(!senderUser) return res.status(401).json({'error' : 'Erreur interne'})
            const senderAccount = await Compte.findOne({where: {id: senderUser.idCompte}})
    
            // on vérifie si le solde disponible sur le compte de l'expéditeur est suffisant
            if(senderAccount.solde < annonceFound.montant ) return res.status(401).json({'error' : 'Impossible d\'effectué cette transaction solde insuffisant'})
    
            // on crédite le compte du receveur
            const recipientUser = await User.findOne({where: {id: IDUSER}})
            if(!recipientUser) return res.status(401).json({'error' : 'Erreur interne'})
            const recipientAccount = await Compte.findOne({where: {id: recipientUser.idCompte}})
    
            recipientAccount.solde += annonceFound.montant
            await recipientAccount.save()
    
            // on débite le compte de l'expéditeur
            senderAccount.solde -= annonceFound.montant
            await senderAccount.save()

            // on retire la visibilité de l'annonce
            annonceFound.isVisible = false 
            await annonceFound.save()

            // on créer un contrat
            const contratEmpt = await Contrat.create({'nom': uuid.v1()})

            // on enregistre l'emprunt
            await Pret.create({idDemandeur: IDUSER, idAnnonce: annonceFound.id, idContrat : contratEmpt.id, statut : 'en cour'})

            // on enregistre le pret
            await Emprunt.create({idContributeur: annonceFound.codeUser , idAnnonce: annonceFound.id, idContrat : contratEmpt.id, statut : 'en cour'})

            return res.status(200).json({'success': 'La transaction s\'est bien passé'})
        }

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

 const refundUserAccount = async (req,res,next) =>{
    const { IDPRET } = req.body
    
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})
    const IDUSER = req.user.id // IDUSER utilisateur en cour ...

    try {
        // on recherche les informations sur l'emprunt
        const pretFound = await Emprunt.findOne({where: {id: IDPRET}})
        if(!pretFound) return res.status(401).json({'error' : 'Erreur interne'})

        // on recupère les information sur l'annonce
        const annonceFound = await Annonce.findOne({where: {id: pretFound.idAnnonce}})
        if(!annonceFound) return res.status(401).json({'error' : 'Erreur interne'})
        
        // on calcule le montant totale du rembourssement avec frais
        const MONTANT_TOTAL = annonceFound.montant + (annonceFound.montant * annonceFound.pourcentage)

        /**
        * ici sera la fonction qui créditera notre prope fond 
        * on devra enlever un pourcentage supplémentaire pour notre société
        */

        const recipientUser = await User.findOne({where: {id: pretFound.idContributeur }})
        if(!recipientUser) return res.status(401).json({'error' : 'Erreur interne'})
       
        const senderUser = await User.findOne({where: {id: IDUSER}})
        const senderAccount = await Compte.findOne({where: {id : senderUser.idCompte}})

        // on vérifie si le solde disponible sur le compte de l'expéditeur est suffisant
        if(senderAccount.solde < MONTANT_TOTAL ) return res.status(401).json({'error' : 'Remboursement annulé votre solde est insuffisant'})

        // on crédite le compte du receveur
        const recipientAccount = await Compte.findOne({where : {id: recipientUser.idCompte}})
        recipientAccount.solde += MONTANT_TOTAL
        await recipientAccount.save()

        // on débite le compte de l'expéditeur
        senderAccount.solde -= MONTANT_TOTAL
        await senderAccount.save()

        // on modifie le status de l'emprunt
        const empt = await Emprunt.findOne({where : {idContrat : pretFound.idContrat}})
        empt.statut = 'rembousé'
        await empt.save()

        // on modifie le status du pret
        const pt = await Pret.findOne({where : {idContrat : pretFound.idContrat}})
        pt.statut = 'rembousé'
        await pt.save()

        return res.status(200).json({'success': 'La transaction s\'est bien passé'})

    } catch (error) {
      //  console.log(error)
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

module.exports = { getUser , editUser, editPassword, refilUserAccount, debitUserAccount, refundUserAccount, addSignature, getSignature, showContrat, toPropose, deleteProposition, resToPropose }