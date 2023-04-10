const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /logout:
 *  get:
 *    summary: Logout user
 *    description: 로그아웃
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 로그아웃 성공 
 *        headers:
 *          Set-Cookie:
 *            description: remove the access token cookie
 *            schema:
 *              type: string
 *              example: access_token=""
 *        
 */

router.get('/', (req, res) =>{
    res.cookie('accesstoken', '', {maxAge:0});
    res.sendStatus(200);
})

module.exports = router;