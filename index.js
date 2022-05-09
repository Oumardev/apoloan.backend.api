const express = require('express')
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

/// ------------------------------ METHOD POST ----------------------------------------------- ///
app.post('/apoloanapi/register',register,(req,res)=>{
    return res.status(200).json({'message':'Utilisateur crée veuillez vous authentifier'})
})

app.post('/apoloanapi/login',login,(req,res)=>{})

app.post('/apoloanapi/annonce.create',createAnnonce,(req,res)=>{
    return res.status(200).json({'message':'Annonce crée'})
})

app.post('/apoloanapi/useraccount.refil',refilUserAccount,(req,res)=>{})

app.post('/apoloanapi/useraccount.debit',debitUserAccount,(req,res)=>{})

app.post('/apoloanapi/useraccount.refound',refundUserAccount,(req,res)=>{})

/// ------------------------------ METHOD GET ----------------------------------------------- ///
app.get('/apoloanapi/annonce.list',listAnnonce,(req,res)=>{})

app.get('/apoloanapi/pret.list',listPret,(req,res)=>{})

app.get('/apoloanapi/emprunt.list',listEmprunt,(req,res)=>{})

app.get('/apoloanapi/user.get',getUser,(req,res)=>{})


/// ------------------------------ METHOD PATCH ----------------------------------------------- ///
app.patch('/apoloanapi/annonce.patch',patchAnnonce,(req,res)=>{})

app.patch('/apoloanapi/user.edit',editUser,(req,res)=>{})

app.patch('/apoloanapi/password.edit',editPassword,(req,res)=>{})


app.listen(3000,'localhost',()=>{
    console.log('serveur en marche sur http://localhost:3000')
})