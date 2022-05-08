const express = require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()
const { register, login } = require('./middleware/auth')
const { createAnnonce, listAnnonce, patchAnnonce } = require('./middleware/annonce')
const { createPret, listPret } = require('./middleware/pret')
const { createEmprunt , listEmprunt } = require('./middleware/emprunt')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

/// ------------------------------ METHOD POST ----------------------------------------------- ///
app.post('/apoloanapi/register',register,(req,res)=>{
    return res.status(200).json({'message':'Utilisateur crée veuillez vous authentifier'})
})

app.post('/apoloanapi/login',login,(req,res)=>{})

app.post('/apoloanapi/annonce/create',createAnnonce,(req,res)=>{
    return res.status(200).json({'message':'Annonce crée'})
})

app.post('/apoloanapi/pret/create',createPret,(req,res)=>{})

app.post('/apoloanapi/emprunt/create',createEmprunt,(req,res)=>{})

/// ------------------------------ METHOD GET ----------------------------------------------- ///
app.get('/apoloanapi/annonce/list',listAnnonce,(req,res)=>{})

app.get('/apoloanapi/pret/list',listPret,(req,res)=>{})

app.get('/apoloanapi/emprunt/list',listEmprunt,(req,res)=>{})


/// ------------------------------ METHOD PATCH ----------------------------------------------- ///
app.patch('/apoloanapi/annonce/patch',patchAnnonce,(req,res)=>{})

app.patch('/apoloanapi/pret/patch',listPret,(req,res)=>{})

app.patch('/apoloanapi/emprunt/patch',listEmprunt,(req,res)=>{})


app.listen(3000,'localhost',()=>{
    console.log('serveur en marche sur http://localhost:3000')
})