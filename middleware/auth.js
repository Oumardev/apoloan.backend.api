const { User, Compte } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = (req,res,next) =>{
    const { nom, prenom, numero, password } = req.body
    const regex = /\d/;

    if( !nom || !prenom || !numero || !password  ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    if (password.length < 8) return res.status(401).json({'error' : 'Le mot de passe doit contenir au moins 8 caractères'})


    // vérifie si les chaines de caractères sont composées uniquement que d'espace
    if( nom.replace(/\s/g, '')=='' || prenom.replace(/\s/g, '')=='' ) return res.status(401).json({'message' : 'Veuillez saisir tout les champs'})

    // vérifie si le nom ou le prenom contiennent des chiffres
    if (regex.test(nom) || regex.test(prenom))  return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des chiffres'})
 
    // vérifie si numéro contient des letttres
    if (!Number.isInteger(numero)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})

    // insertion
    try {
        bcrypt.hash(password, 10, async (err, hashPassword)=>{
            if(err) return res.status(401).json({'error':'Erreur interne'})
            const password = hashPassword
            
            try {
                const cmpt = await Compte.create({solde: 0.0})
                const idCompte = cmpt.id

                const usr = await User.create({ nom, prenom, numero, password, idCompte })
                if(!usr) return res.status(401).json({'error':'Utilisateur ne peut etre crée'})
                
                const token = jwt.sign(usr.dataValues,process.env.SECRET_TOKEN,{expiresIn : '1h'})
                return res.status(200).json({'token': token, 'isLogin': true})

            } catch (error) {
                return res.status(401).json({'error':'Cet numéro existe déja'})
            }
           
        })   
    } catch (error) {
        return res.status(401).json({'error':'Erreur interne',error})
    }

}

const login = async (req,res,next) =>{
    const { numero, password } = req.body

    if( !numero || !password  ) return res.status(401).json({'error' : 'Veuillez saisir tout les champs'})

    // vérifie si numéro contient des letttres
    if (!Number.isInteger(numero)) return res.status(401).json({'error' : 'Certaines informations ne doivent pas contenir des lettres'})

    // search user
    try {
        
        var userFound = await User.findOne({
            where: {'numero': numero},
            attributes: {exclude: ['signature']},
        })
        
        if(!userFound) return res.status(401).json({'error': 'Identifiant incorect'})

        const prevPassword = userFound.dataValues.password
        
        bcrypt.compare(password, prevPassword,(err, data)=>{
            if(err) return res.status(401).json({'error':'Erreur interne'})

            if(!data) return res.status(401).json({'error': 'Identifiant incorect'})

            const token = jwt.sign(userFound.dataValues,process.env.SECRET_TOKEN,{expiresIn : '1h'})
            
            return res.status(200).json({'token': token, 'isLogin': true})
        })

    } catch (error) {
        return res.status(401).json({'error':'Erreur internse',error})
    }
    
}


module.exports ={ register, login }
