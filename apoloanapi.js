const express = require('express')
const { sequelize, User, Compte } = require('./models')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').Server(app)
require('dotenv').config()
const { register, login } = require('./middleware/auth')
const { createAnnonce, listAnnonce, patchAnnonce, deleteAnnonce, listPost } = require('./middleware/annonce')
const { listProposition } = require('./middleware/proposition')
const { listPret } = require('./middleware/pret')
const { listEmprunt } = require('./middleware/emprunt')
const { fetchtoecobank, getbankaccount } = require('./middleware/ecobank')
const { getUser, editUser, editPassword, refilUserAccount, addSignature, getSignature, showContrat, toPropose, deleteProposition, resToPropose, refilBankAccount, showPayment, makePayment } = require('./middleware/user')
const { VerifyToken } = require('./middleware/verifyToken')
const jwt = require('jsonwebtoken')
const cors = require('cors');
const io = require('socket.io')(server)

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

var CLIENTS=[];
io.on('connection', (ws) => {
    ws.id = uuidv4();
    CLIENTS.push(ws)

    console.log('connect')
    ws.emit('id',ws.id)
    
    ws.on('message', (messageAsString) => {
      console.log(`New message ${messageAsString}`)
    });

    ws.on('qrcode', (data) => {
        const wscli = CLIENTS.filter(item => item.id === data.qr)[0]
        wscli.emit('status', data)
    });

    ws.on('savesign', (data) => {
        const wscli = CLIENTS.filter(item => item.id === data.qr)[0]
        
        wscli.emit('pagesign', data)
    });

    ws.on("close", () => {
        console.log('session close')
    });

});

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'));

app.set('view engine', 'ejs');

const multer = require('multer')
const uidcontratname = () =>{
    const head = Date.now().toString(36)
    const tail = Math.random().toString(36).substring(2)
    return head + tail + '.pdf'
}

var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './contratdocuments');    
    }, 
    filename: function (req, file, cb) { 
       cb(null , uidcontratname());   
    }
});

const upload = multer({ storage: storage})

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "APOLOAN API DOCUMENTATION",
        version: '3.2.0',
        description : 'Apoloan est une plateforme Peer to Peer qui permet aux membres d\'accéder ou fournir facilement des fonds à court terme pour des besoins immédiats de facon discrèt et sécurisée.',
        url: "http://www.oumardev.com",
        contact: {
            name: "Oumar CISSE",
            url: "http://www.oumardev.com", 
        },
        licence:{
            name: "oumar ccisse",
            url:  "http://www.oumardev.com"
        }
      },
        servers: [
            {
                url: `http://www.oumardev.com`
            }
        ],
        securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                scheme: 'bearer',
                in: 'header',
            },
        },
        
    },

    apis: ["apoloanapi.js"],
};

var options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "APOLOAN API",
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/apoloanapi-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs,options));

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

const checkconttat = (req,res,next) =>{
    const URL = req.query.urltemp
    jwt.verify(URL, process.env.SECRET_TOKEN_CONTRAT, (err, data)=>{
        if(err) return res.send('Ce contrat a expiré la période de validité est 2 jours')
        req.var = data
        if(data) next()
        else return res.send('Access denied')
    })
}

app.get('/cosntr',VerifyToken,checkconttat,async (req,res)=>{
    console.log('in cosnt')
    const data = req.var
    
    const signUser = await User.findOne({
        where: {id: req.user.id}, 
        attributes: ['id','signature'],
    })
    if(!signUser) res.send('Error')

    const signProposant = await User.findOne({
        where: {id: data.data.proposant.id}, 
        attributes: ['id','signature'],
    })
    if(!signProposant) res.send('Error')

    if(!signUser.dataValues.signature){
        return res.send('<p style="color:red;text-align:center">Vous devez enregistrer une signature avant de continuer l\'opération</p>')
    }

    
    res.render('pages/contrat/index',{
        'user': req.user,
        'proposant': data.data.proposant,
        'annonce': data.data.annonce,
        'dateEcheance': new Date(),
        'date': new Date(),
        'sign': signUser.dataValues.signature,
        'signProposant': signProposant.dataValues.signature,
        'token': req.token
    });
});

app.get('/apoloanapi/contrat',VerifyToken,showContrat,(req,res)=>{})

app.get('/testconn',(req,res)=>{
    return res.status(200).json({'success' : 'connected'})
})

app.get('/apoloanapi/signature',(req,res)=>{
    res.render('pages/signature/index');
});

app.get('/apoloanapi/qrcode',(req,res)=>{
    res.render('pages/qrCode/index');
});

app.post('/apoloanapi/addsignature',VerifyToken,addSignature,(req,res)=>{});

app.get('/apoloanapi/getsignature',getSignature,(req,res)=>{})

app.post("/upload_files", upload.single("file") , function (req, res) {});

/**
 * @swagger
 * /apoloanapi/fetchtoecobank:
 *   post:
 *     tags:
 *     - "Bank"
 *     summary: Activer un compte apoloan 
 *     description: Ce lien est utilisé pour vérifier et activer le compte de l'utilisateur l'orsque'il rentre ses informations bancaire
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre d'activation de compte Apoloan
 *        schema:
 *         type: object
 *         properties:
 *           CardNumber:
 *              type: string
 *           Name:
 *              type: string
 *           Expiry:
 *              type: string
 *           CVV:
 *              type: string 
 *        required: true
 *     responses:
 *       200:
 *         description: Votre compte apoloan a été activé
 */
app.post('/apoloanapi/fetchtoecobank',fetchtoecobank,(req,res)=>{})

//
/**
 * @swagger
 * /apoloanapi/makepayment:
 *   post:
 *     tags:
 *     - "Versement"
 *     summary: Effectuer un versement
 *     description: Ce lien est utilisé pour effectuer un versement pour pret
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre
 *        schema:
 *         type: object
 *         properties:
 *           IDPAYMENT:
 *              type: integer 
 *        required: true
 *     responses:
 *       201:
 *         description: Affichage du compte
 */
app.post('/apoloanapi/makepayment',makePayment,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/showpayment:
 *   post:
 *     tags:
 *     - "Versement"
 *     summary: Envoie les informations sur les versements par rapport a une transaction
 *     description: Ce lien est utilisé pour afficher les versements
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre d'affichage
 *        schema:
 *         type: object
 *         properties:
 *           IDTRANSACTION:
 *              type: integer 
 *        required: true
 *     responses:
 *       201:
 *         description: Affichage du compte
 */
app.post('/apoloanapi/showpayment',showPayment,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/getbankaccount:
 *   post:
 *     tags:
 *     - "Bank"
 *     summary: Envoie les informations sur le compte bancaire
 *     description: Ce lien est utilisé pour afficher le compte en banque
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre d'affichage
 *        schema:
 *         type: object
 *         properties:
 *           id:
 *              type: integer 
 *        required: true
 *     responses:
 *       201:
 *         description: Affichage du compte
 */
app.post('/apoloanapi/getbankaccount',getbankaccount,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/listproposition:
 *   post:
 *     tags:
 *     - "Proposition"
 *     summary: Lister les propositions d'une annonce
 *     description: Ce lien est utilisé pour afficher la liste des propositions sur une annonce
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre d'affichage de proposition
 *        schema:
 *         type: object
 *         properties:
 *           IDANNONCE:
 *              type: integer
 *        required: true
 *     responses:
 *       200:
 *         description: Affichage de la liste des proposition
 */
app.post('/apoloanapi/listproposition',listProposition,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/topropose:
 *   post:
 *     tags:
 *     - "Proposition"
 *     summary: Faire une proposition 
 *     description: Ce lien est utilisé par un utilisateur pour effectuer une proposition sur une annonce qu'il a vue
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre de proposition
 *        schema:
 *         type: object
 *         properties:
 *           IDANNONCE:
 *              type: integer
 *        required: true
 *     responses:
 *       200:
 *         description: Votre proposition a été envoyé elle sera supprimé automatiquement si l'utilisateur la rejette
 */
app.post('/apoloanapi/topropose',toPropose,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/deleteproposition:
 *   delete:
 *     tags:
 *     - "Proposition"
 *     summary: Supprimer une proposition 
 *     description: Ce lien est utilisé par un utilisateur pour supprimer une proposition
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: Paramètre de suppression de proposition
 *        schema:
 *         type: object
 *         properties:
 *           IDANNONCE:
 *              type: integer
 *        required: true
 *     responses:
 *       200:
 *         description: La proposition a été supprimé
 */
app.delete('/apoloanapi/deleteproposition',VerifyToken,deleteProposition,(req,res)=>{})

app.post('/apoloanapi/restopropose',VerifyToken,resToPropose,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/annonce/create:
 *   post:
 *     tags:
 *     - "Annonce"
 *     summary: Créer une annonce
 *     description: Ce lien est utilisé pour créer une annonce
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object   
 *        schema:
 *         type: object
 *         properties:
 *           type:
 *              type: string 
 *           duree:
 *              type: string
 *           montant:
 *              type: integer
 *           modalitePaiement:
 *              type: string
 *        required: true
 *     responses:
 *       201:
 *         description: L'annonce a été créé
 */
app.post('/apoloanapi/annonce/create',VerifyToken,createAnnonce,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/useraccount/refil:
 *   post:
 *     tags:
 *     - "Bank"
 *     summary: Recharger le solde
 *     description: Ce lien est utilisé pour recharger le solde de l'utilisateur
 *     security:
 *      - bearerAuth: []  
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
 * /apoloanapi/useraccount/refilbankaccount:
 *   post:
 *     tags:
 *     - "Bank"
 *     summary: Recharger le solde en banque
 *     description: Ce lien est utilisé pour recharger le solde en banque
 *     security:
 *      - bearerAuth: []  
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           montant:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: Rechargement effectué
 */
app.post('/apoloanapi/useraccount/refilbankaccount',refilBankAccount,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/annonce/list:
 *   get:
 *     tags:
 *     - "Annonce"
 *     summary: Liste des annonces
 *     description: Ce lien est utilisé pour afficher la liste des annonces pour l'utilisateur connecté
 *     security:
 *      - bearerAuth: [] 
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
 *     security:
 *      - bearerAuth: [] 
 *     responses:
 *       201:
 *         description: Liste des prèts
 *         schema:
 *          type: object
 *          properties:
 *              statut:
 *                type: string
 *              Contrat:
 *                type: object
 *                properties:
 *                  nom:
 *                    type: string
 *              Annonce:
 *                type: object
 *                properties:
 *                  duree:
 *                    type: string
 *                  pourcentage:
 *                    type: integer
 *                  montant:
 *                    type: integer
 *                  createdAt:
 *                    type: string      
 */
app.get('/apoloanapi/pret/list',listPret,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/emprunt/list:
 *   get:
 *     tags:
 *     - "Pret"
 *     summary: Liste des emprunts de l'utilisateur
 *     description: Ce lien est utilisé pour afficher la liste des emprunts d'un utilisateur
 *     security:
 *      - bearerAuth: [] 
 *     responses:
 *       201:
 *         description: Liste des emprunts
 *         schema:
 *          type: object
 *          properties:
 *              statut:
 *                type: string
 *              Contrat:
 *                type: object
 *                properties:
 *                  nom:
 *                    type: string
 *              Annonce:
 *                type: object
 *                properties:
 *                  duree:
 *                    type: string
 *                  pourcentage:
 *                    type: integer
 *                  montant:
 *                    type: integer
 *                  createdAt:
 *                    type: string      
 */
app.get('/apoloanapi/emprunt/list',listEmprunt,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/post/list:
 *   get:
 *     tags:
 *     - "Annonce"
 *     summary: Liste des postes de l'utilisateur
 *     description: Ce lien est utilisé pour afficher la liste des postes d'un utilisateur
 *     security:
 *      - bearerAuth: [] 
 *     responses:
 *       201:
 *         description: Liste des postes
 *         schema:
 *          type: object
 *          properties:
 *              statut:
 *                type: string
 *              Contrat:
 *                type: object
 *                properties:
 *                  nom:
 *                    type: string
 *              Annonce:
 *                type: object
 *                properties:
 *                  duree:
 *                    type: string
 *                  pourcentage:
 *                    type: integer
 *                  montant:
 *                    type: integer
 *                  createdAt:
 *                    type: string      
 */
 app.get('/apoloanapi/post/list',listPost,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/user:
 *   get:
 *     tags:
 *     - "User"
 *     summary: Information utilisateur
 *     description: Utilisé pour afficher les informations de l'utilisateur connecté
 *     security:
 *      - bearerAuth: [] 
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
app.get('/apoloanapi/user',VerifyToken,getUser,(req,res)=>{})

/**
 * @swagger
 * /apoloanapi/annonce:
 *   patch:
 *     tags:
 *     - "Annonce"
 *     summary: Modifier une annonce 
 *     description: Ce lien est utilisé pour modifier une annonce
 *     security:
 *      - bearerAuth: [] 
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
 *              type: integer
 *           modalitePaiement:
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
 *     security:
 *      - bearerAuth: [] 
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
 *     security:
 *      - bearerAuth: [] 
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

/**
 * @swagger
 * /apoloanapi/annonce:
 *   delete:
 *     tags:
 *     - "Annonce"
 *     summary: Supprimer une annonce 
 *     description: Ce lien est utilisé pour supprimer une annonce
 *     security:
 *      - bearerAuth: [] 
 *     parameters:
 *      - in: body
 *        name: body
 *        description: object
 *        schema:
 *         type: object
 *         properties:
 *           idAnnonce:
 *              type: integer
 *        required: true
 *     responses:
 *       201:
 *         description: Annonce supprimé
 */
app.delete('/apoloanapi/annonce',VerifyToken,deleteAnnonce,(req,res)=>{})

    server.listen(process.env.PORT, process.env.ADDRESS,async()=>{
    try {
        await sequelize.authenticate()
        console.log(`serveur en marche sur http://${process.env.ADDRESS}:${process.env.PORT} ${new Date()}`)
    } catch (error) {
        console.log(error)
        console.log('error to connected server to database')
    }
})