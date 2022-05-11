const { User, Compte, Annonce, Emprunt, Contrat, Pret } = require('../models')
const { VerifyToken } = require('./verifyToken')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

const getUser = async (req,res,next) =>{
    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'message':'Erreur interne'})

    const IDUSER = req.user.id

    try {
        const userFound = await User.findOne({where: {id: IDUSER}, include: Compte})
        if(!userFound) return res.status(401).json({'message' : 'Erreur interne'})

        return res.status(200).json({'user': userFound})   

    } catch (error) {
        return res.status(401).json({'message' : 'Erreur interne'})
    }
}

const editUser = async (req,res,next) =>{
    const { nom, prenom, age, adresse, fonction } = req.body

    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'message':'Erreur interne'})

    const IDUSER = req.user.id

    if( !nom || !prenom || !age || !adresse || !fonction ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si les chaines de caractères sont composées uniquement que d'espace
    if( nom.replace(/\s/g, '')=='' || prenom.replace(/\s/g, '')=='' || adresse.replace(/\s/g, '')=='' || fonction.replace(/\s/g, '')=='' ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si le nom ou le prenom contiennent des chiffres
    if ( regex.test(nom) || regex.test(prenom) )  return res.status(401).json({'message' : 'Certaines informations ne doivent pas contenir des chiffres'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(401).json({'message' : 'Erreur interne'})

        userFound.nom = nom
        userFound.prenom = prenom
        userFound.age = age
        userFound.adresse = adresse
        userFound.fonction = fonction

        await userFound.save()
        return res.status(200).json({'Utilisateur modifié ': userFound})   

    } catch (error) {
        return res.status(401).json({'message' : 'Erreur interne'})
    }
}

const editPassword = async (req,res,next) =>{
    const { oldPassword ,newPassword } = req.body

    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'message':'Erreur interne'})
    const IDUSER = req.user.id

    if (newPassword.length < 8) return res.status(401).json({'message' : 'Le mot de passe doit contenir au moins 8 caractères'})

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(401).json({'message' : 'Erreur interne'})

        bcrypt.compare(userFound.password, oldPassword, (err, data)=>{
            if(err) return res.status(401).json({'message' : 'Erreur interne'})

            if(!data) return res.status(401).json({'message' : 'Votre mot de passe actuel n\'est pas valide'})

            bcrypt.hash(newPassword, 10, async (err, hashPassword)=>{
                if(err) return res.status(401).json({'message' : 'Erreur interne'})

                userFound.password = hashPassword
                await userFound.save()
                return res.status(200).json({message : 'Mot de passe modifié'}) 
            })

        })

    } catch (error) {
        return res.status(401).json({'message' : 'Erreur interne'})
    }
}

/**
 * Cette fonction s'éxécutera quand un utilisateur
 * effectuera un rechargement
 */
const refilUserAccount = async (req,res,next) =>{
    const { montant } = req.body

    VerifyToken(req,res,next)

    const user = req.user
    if(!user) return res.status(401).json({'message':'Erreur interne'})
    const IDUSER = req.user.id

    /**
     * ici seront les fonctions de vérification du solde de la carte bancaire 
     * en fonction du montant de rechargement demandé
     * pour l'instant nous nous contentons de recharger le solde directement a partir du montant demandé 
     * sans vérification
     */

    try {
        const userFound = await User.findOne({where: {id: IDUSER}})
        if(!userFound) return res.status(401).json({'message' : 'Erreur interne'})

        const userAccount = await Compte.findOne({where: {id: userFound.idCompte}})
        if(!userAccount) return res.status(401).json({'message' : 'Le compte a une erreur'})

        userAccount.solde += montant

        await userAccount.save()
        return res.status(201).json({'Rechargement effectué: ' : userAccount})

    } catch (error) {
        return res.status(401).json({'message' : 'Erreur interne'})
    }
}

/**
 * Cette fonction s'exécutera quand un contributeur 
 * prendra part a une annonce de type ['EMPRUNTEUR'] 
 * ou quand un emprunteur prendra part a une annonce de type ['CONTRIBUTEUR']
 */
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
            if(!senderUser) return res.status(401).json({'error' : 'Erreur interne'})
            const senderAccount = await Compte.findOne({where: {id: senderUser.idCompte}})
    
            // on vérifie si le solde disponible sur le compte de l'expéditeur est suffisant
            if(senderAccount.solde < annonceFound.montant ) return res.status(401).json({'error' : 'Impossible d\'effectué cette transaction solde insuffisant'})
    
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

            return res.status(201).json({'success': 'La transaction s\'est bien passé'})

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

            return res.status(201).json({'success': 'La transaction s\'est bien passé'})
        }

    } catch (error) {
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

/**
 * Cette fonction s'exécutera quand un emprunteur 
 * devra remboursser avec pourcentage un pret 
 */
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
        pretFound.statut = 'rembousé'
        await pretFound.save()

        return res.status(201).json({'success': 'La transaction s\'est bien passé'})

    } catch (error) {
      //  console.log(error)
        return res.status(401).json({'error' : 'Erreur interne'})
    }
}

module.exports = { getUser , editUser, editPassword, refilUserAccount, debitUserAccount, refundUserAccount }