const { User, Compte } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = (req,res,next) =>{
    const { nom, prenom, numero, age, sexe, adresse, fonction, numeroCNI, password } = req.body
    const regex = /\d/;

    if (password.length < 8) return res.status(401).json({'message' : 'Le mot de passe doit contenir au moins 8 caractères'})

    if( !nom || !prenom || !numero || !age || !sexe || !adresse || !fonction || !numeroCNI || !password  ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si les chaines de caractères sont composées uniquement que d'espace
    if( nom.replace(/\s/g, '')=='' || prenom.replace(/\s/g, '')=='' || sexe.replace(/\s/g, '')=='' || adresse.replace(/\s/g, '')=='' || fonction.replace(/\s/g, '')=='' ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si le nom ou le prenom contiennent des chiffres
    if (regex.test(nom) || regex.test(prenom) || regex.test(sexe))  return res.status(401).json({'message' : 'Certaines informations ne doivent pas contenir des chiffres'})
 
    // vérifie si numéro contient des letttres
    if (!Number.isInteger(numero)) return res.status(401).json({'message' : 'Certaines informations ne doivent pas contenir des lettres'})

    // insertion
    try {
        bcrypt.hash(password, 10, async (err, hashPassword)=>{
            if(err) return res.status(401).json({'message':'Erreur interne'})
            const password = hashPassword
            
            try {
                const cmpt = await Compte.create({solde: 0.0})
                const idCompte = cmpt.id

                const usr = await User.create({ nom, prenom, numero, age, sexe, adresse, fonction, numeroCNI, password, idCompte })
                if(!usr) return res.status(401).json({'message':'Utilisateur ne peut etre crée'})
                next()

            } catch (error) {
                return res.status(401).json({'message':'Cet numéro est déja'})
            }
           
        })   
    } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})
    }

}

const login = async (req,res,next) =>{
    const { numero, password } = req.body

    if( !numero || !password  ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si numéro contient des letttres
    if (!Number.isInteger(numero)) return res.status(401).json({'message' : 'Certaines informations ne doivent pas contenir des lettres'})

    // search user
    try {
        
        var userFound = await User.findOne({where: {'numero': numero}})

        if(!userFound) return res.status(401).json({'message': 'Identifiant incorect'})

        const prevPassword = userFound.dataValues.password
        
        bcrypt.compare(password, prevPassword,(err, data)=>{
            if(err) return res.status(401).json({'message':'Erreur interne'})

            if(!data) return res.status(401).json({'message': 'Identifiant incorect'})

            const token = jwt.sign(userFound.dataValues,process.env.SECRET_TOKEN,{expiresIn : '1h'})

            return res.status(401).json({'token': token, 'isLogin': true})
        })

    } catch (error) {
        return res.status(401).json({'message':'Erreur interne',error})
    }
    
}


module.exports ={ register, login }
