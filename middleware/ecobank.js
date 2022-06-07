const { Compte, User } = require('../models')
const fetch = require('node-fetch');
const { VerifyToken } = require('./verifyToken')
require('dotenv').config()

const fetchtoecobank = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user

    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const { CardNumber, Name, Expiry, CVV } = req.body
   
    if( !CardNumber || !Name || !Expiry || !CVV  ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    fetch(`${process.env.BANK_ADDRESS}/ecobank/api/connectaccounttoapoloan`, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    .then(async response => {
        if(response.error){
            return res.status(401).json(response)
        }
        
        if(response.idbankaccount){
            const cpt = await Compte.findOne({where:{id: user.idCompte}})
            if(!cpt) return res.status(401).json({'error' : 'Erreur interne'})

            cpt.idbankaccount = response.idbankaccount
            await cpt.save()

            const usr = await User.findOne({where:{id: user.id}})
            if(!usr) return res.status(401).json({'error' : 'Erreur interne'})

            usr.isActivated = true
            await usr.save()

            return res.status(200).json({'success' : 'La transaction s\'est bien passé'})
        }

    })
    .catch(err => console.log(err));
}

const getbankaccount = async (req,res,next) =>{
    VerifyToken(req,res,next)
    const user = req.user
    if(!user) return res.status(401).json({'error':'Erreur interne'})

    const cpt = await Compte.findOne({where:{id: user.idCompte}})
    if(!cpt) return res.status(401).json({'error' : 'Erreur interne'})
    if(!cpt.idbankaccount) res.status(401).json({'error' : 'Ce compte n\'est pas activée'})
   
    console.log(`id: ${cpt.idbankaccount}`)
    fetch(`${process.env.BANK_ADDRESS}/ecobank/api/getbankaccount`, {
        method: 'POST',
        body: JSON.stringify({id: cpt.idbankaccount}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    .then(async response => {
        if(response.error) return res.status(401).json(response)
        if(response.success) return res.status(200).json(response)
    })
    .catch(err => console.log(err));
}

module.exports ={ fetchtoecobank, getbankaccount }