const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretkey').acessSecretKey;
const option = require('../config/secretkey').option;

module.exports = {
    sign: function (user) {
        const payload = {
            id: user[0].id,
            name: user[0].name,
            author: user[0].author
        };
        return jwt.sign(payload, secretKey, option);
    },
    verify: function(token){
        try{
            const decoded = jwt.verify(token, secretKey);
            return decoded;
        } catch(error){
            if(error.name == "TokenExpiredError"){
                return 419;
            }else if(error.name == "JsonWebTokenError"){
                return 401;
            }
        } 
    }
}