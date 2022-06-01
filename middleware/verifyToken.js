const jwt = require('jsonwebtoken')

const VerifyToken = (req,res,next) =>{
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    jwt.verify(token, process.env.SECRET_TOKEN, (err, user)=>{
        if(user){
            req.user = user
            next()
        }else{
            res.send('Access denied').end()
        }
    })
}

module.exports = { VerifyToken }