const jwt = require('jsonwebtoken')


const VerifyToken = (req,res,next) =>{
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    jwt.verify(token, process.env.SECRET_TOKEN, (err, user)=>{
        if (err) return res.status(401).json({'message':'Erreur interne'})

        req.user = user
        next()
    })

}

module.exports = { VerifyToken }