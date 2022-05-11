const express = require('express')
const { sequelize } = require('./models')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()
const { register, login } = require('./middleware/auth')
const { createAnnonce, listAnnonce, patchAnnonce } = require('./middleware/annonce')
const { listPret } = require('./middleware/pret')
const { listEmprunt } = require('./middleware/emprunt')
const { getUser, editUser, editPassword, refilUserAccount, debitUserAccount, refundUserAccount } = require('./middleware/user')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "APOLOAN API DOCUMENTATION",
        version: '2.0.1',
      },
    },
    apis: ["index.js"],
};

var options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "APOLOAN API",
  };
  

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/apoloanapi-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs,options));

/// ------------------------------ METHOD POST ----------------------------------------------- ///
/**
 * @swagger
 * /apoloanapi/register:
 *   post:
 *     tags:
 *     - "User"
 *     summary: Inscription 
 *     description: Ce lien est utilisé pour s'inscrire
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre de connexion
 *        schema:
 *         type: object
 *         properties:
 *           nom:
 *              type: string
 *           prenom:
 *              type: string
 *           numero:
 *              type: integer
 *           age:
 *              type: integer
 *           sexe:
 *              type: string
 *           adresse:
 *              type: string
 *           fonction:
 *              type: string 
 *           numeroCNI:
 *              type: integer
 *           password:
 *              type: string    
 *        required: true
 *     responses:
 *       201:
 *         description: Utilisateur crée veuillez vous authentifier
 */
app.post('/apoloanapi/register',register,(req,res)=>{
    return res.status(200).json({'success':'Utilisateur crée veuillez vous authentifier'})
})

/**
 * @swagger
 * /apoloanapi/login:
 *   post:
 *     tags:
 *     - "User"
 *     summary: Connexion 
 *     description: Ce lien est utilisé pour se connecter
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Parametre de connexion
 *        schema:
 *         type: object
 *         properties:
 *           numero:
 *              type: integer
 *           password:
 *              type: string
 *                  
 *        required: true
 *     responses:
 *       201:
 *         description: Connexion réussite
 *         schema:
 *          type: object
 *          properties:
 *              token:
 *                type: string
 *              isLogin:
 *                type: boolean
 */
app.post('/apoloanapi/login',login,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/annonce/create:
 *   post:
 *     tags:
 *     - "Annonce"
 *     summary: Créer une annonce
 *     description: Ce lien est utilisé pour créer une annonce
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           type:
 *              type: array
 *              items:
 *                  type: object
 *                  properties:
 *                      PRET:
 *                         type: string
 *                      EMPRUNT:
 *                         type: string
 *           duree:
 *              type: string
 *           pourcentage:
 *              type: integer
 *           montant:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: L'annonce a été créé
 */
app.post('/apoloanapi/annonce/create',createAnnonce,(req,res)=>{
    return res.status(200).json({'success':'Annonce crée'})
})

/**
 * @swagger
 * /apoloanapi/useraccount/refil:
 *   post:
 *     tags:
 *     - "User"
 *     summary: Se recharger 
 *     description: Ce lien est utilisé pour recharger le solde de l'utilisateur 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           montant:
 *              type: integer
 * 
 *        required: true
 *     responses:
 *       201:
 *         description: Rechargement effectué
 */
app.post('/apoloanapi/useraccount/refil',refilUserAccount,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/useraccountdebit:
 *   post:
 *     tags:
 *     - "Annonce"
 *     summary: Débiter / Créditer (Selon type Annonce)
 *     description: Ce lien sera utilisé pour débiter le compte de l'utilisateur quand il voudra contribuer a une annonce d'emprunt ou quand un emprunteur sera intéressé par une annonce de pret
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           IDANNONCE:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: La transaction s'est bien passé
 */
app.post('/apoloanapi/useraccount/debit',debitUserAccount,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/useraccount/refound:
 *   post:
 *     tags:
 *     - "Annonce"
 *     summary: Remboursser un pret
 *     description: Ce lien sera utilisé pour le rembourssement d'un pret 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           IDPRET:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: Rembourssement effectué
 */
app.post('/apoloanapi/useraccount/refound',refundUserAccount,(req,res)=>{})

/// ------------------------------ METHOD GET ----------------------------------------------- ///
/**
 * @swagger
 * /apoloanapi/annonce/list:
 *   get:
 *     tags:
 *     - "Annonce"
 *     summary: Liste des annonces
 *     description: Ce lien est utilisé pour afficher la liste des annonces pour l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Information sur les annonces listé
 *         schema:
 *          type: object
 *          properties:
 *              id:
 *                type: integer
 *              type:
 *                type: string
 *              duree:
 *                type: string
 *              pourcentage:
 *                type: integer 
 *              montant:
 *                type: integer 
 *              isBooster:
 *                type: boolean
 *              isVisible:
 *                type: boolean
 *              createdAt:
 *                type: string 
 *              updatedAt:
 *                type: integer  
 *              user:
 *                type: object
 *                properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   prenom:
 *                     type: string
 *                   numero:
 *                     type: integer
 *                   age:
 *                     type: integer
 *                   sexe:
 *                     type: string
 *                   adresse:
 *                     type: string
 *                   fonction:
 *                     type: string
 *                   numeroCNI:
 *                     type: integer
 */
app.get('/apoloanapi/annonce/list',listAnnonce,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/pret/list:
 *   get:
 *     tags:
 *     - "Pret"
 *     summary: Liste des pret de l'utilisateur
 *     description: Ce lien est utilisé pour afficher la liste des prets d'un utilisateur
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        required: true
 *     responses:
 *       201:
 *         description: Annonce crée
 */
app.get('/apoloanapi/pret/list',listPret,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/emprunt/list:
 *   get:
 *     tags:
 *     - "Emprunt"
 *     summary: Liste des emprunts de l'utilisateur
 *     description: Ce lien est utilisé pour afficher la liste des emprunts d'un utilisateur
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        required: true
 *     responses:
 *       200:
 *         description: Emprunt listé 
 */
app.get('/apoloanapi/emprunt/list',listEmprunt,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/user:
 *   get:
 *     tags:
 *     - "User"
 *     summary: Information utilisateur
 *     description: Utilisé pour afficher les informations de l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Information listé
 *         schema:
 *          type: object
 *          properties:
 *              id:
 *                type: integer
 *              nom:
 *                type: string
 *              prenom:
 *                type: string
 *              numero:
 *                type: integer 
 *              age:
 *                type: integer 
 *              sexe:
 *                type: string
 *              adresse:
 *                type: string
 *              fonction:
 *                type: string
 *              numeroCNI:
 *                type: string
 *              createdAt:
 *                type: string 
 *              updatedAt:
 *                type: integer  
 *              compte:
 *                type: object
 *                properties:
 *                   solde:
 *                      type: integer
 */
app.get('/apoloanapi/user',getUser,(req,res)=>{
})


/// ------------------------------ METHOD PATCH ----------------------------------------------- ///
/**
 * @swagger
 * /apoloanapi/annonce:
 *   patch:
 *     tags:
 *     - "Annonce"
 *     summary: Modifier une annonce 
 *     description: Ce lien est utilisé pour modifier une annonce
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           idAnnonce:
 *              type: integer
 *           duree:
 *              type: string
 *           pourcentage:
 *              type: integer
 *           montant:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: Annonce modifié
 */
app.patch('/apoloanapi/annonce',patchAnnonce,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/user:
 *   patch:
 *     tags:
 *     - "User"
 *     summary: Modifier utilisateur 
 *     description: Ce lien est utilisé pour modifier les informations de l'utilisateur connecté
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           nom:
 *              type: string
 *           prenom:
 *              type: string
 *           age:
 *              type: integer
 *           adresse:
 *              type: string
 *           fonction:
 *              type: string
 *        required: true
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 */
app.patch('/apoloanapi/user',editUser,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/password:
 *   patch:
 *     tags:
 *     - "User"
 *     summary: Modifier mot de passe 
 *     description: Ce lien est utilisé pour modifier le mot de passe de l'utilisateur
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           oldPassword:
 *              type: string
 *           newPassword:
 *              type: string
 *        required: true
 *     responses:
 *       201:
 *         description: Mot de passe modifié
 */
app.patch('/apoloanapi/password',editPassword,(req,res)=>{})


app.listen(2500,'86.107.197.161', async()=>{
    try {
        await sequelize.authenticate()
        console.log('serveur en marche sur http://www.oumardev.com:2500')
    } catch (error) {
        console.log(error)
        console.log('error to connected server to database')
    }
})