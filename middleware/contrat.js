const { Contrat } = require('../models')
const uuid = require('uuid')

const createContrat = async (req,res,next) =>{

    try {
        const contrat = await Contrat.create({'nom': uuid.v1()})
        if(!contrat) return res.status(401).json({'message':'Erreur interne',error})
        return contrat

        next()
        } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})
    }
    
}

module.exports = { createContrat }