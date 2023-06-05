const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /login/find_id:
 *  post:
 *    summary: Find ID
 *    description: 학번 찾기
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 이름
 *              email:
 *                type: string
 *                description: 이메일
 *    responses:
 *      '200':
 *        description: 학생 아이디 찾기 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 학번
 *      '201':
 *        description: 교수 아이디 찾기 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 학번
 *      '401':
 *        description: 아이디 찾기 실패
 */

router.post('/find_id', async (req, res) => {
    try{
        let name = req.body.name;
        let email = req.body.email;
        const [result] = await db.promise().query(`SELECT id FROM studenttable WHERE name = ? AND email = ?`,[name,email]);
        if(result.length > 0){
            return res.status(200).send(result[0]);
        } else{
            const [result2] = await db.promise().query(`SELECT id FROM professortable WHERE name = ? AND email = ?`, [name,email]);
            if(result2.length > 0){
                return res.status(201).send(result2[0]);
            } else{
                return res.sendStatus(401);
            }
        }
    } catch (err) {
        throw err;
    }
})

/**
 * @openapi
 * /login/change_pw:
 *  post:
 *    summary: Change password
 *    description: 비밀번호 변경
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                description: 새 비밀번호
 *              author:
 *                type: integer
 *                description: 권한
 *              id:
 *                type: integer
 *                description: 학번
 *    responses:
 *      '200':
 *        description: 학생 비밀번호 변경 성공
 *      '201':
 *        description: 교수 비밀번호 변경 성공
 */

router.post('/change_pw', async (req, res) =>{
    try{
        let password = req.body.password;
        let author = req.body.author;
        let id = req.body.id;
        if(author == 1){
            db.promise().query(`update studenttable set password = ? where id=?`,[password, id]);
            return res.sendStatus(200);
            
        }else{
            db.promise().query(`update professortable set password = ? where id=?`, [password, id]);
            return res.sendStatus(201);
        }
    } catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /login/find_pw:
 *  post:
 *    summary: Find password
 *    description: 비밀번호 찾기
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: 학번
 *              email:
 *                type: string
 *                description: 이메일
 *    responses:
 *      '200':
 *        description: 학생 비밀번호 찾기 성공
 *      '201':
 *        description: 교수 비밀번호 찾기 성공
 *      '401':
 *        description: 비밀번호 찾기 실패
 */

router.post('/find_pw', async (req, res) =>{
    try{
        let id = req.body.id;
        let email = req.body.email;
        const [result] = await db.promise().query(`SELECT * FROM studenttable WHERE id = ? AND email = ?`, [id,email]);
        if(result.length > 0){
            return res.sendStatus(200);
        }else{
            const [result2] = await db.promise().query(`select * from professortable where id = ? and email = ?`, [id,email]);
            if(result2.length > 0){
                return res.sendStatus(201);
            }
            else{
                return res.sendStatus(401);
            }
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi 
 * /login:
 *  post:
 *    summary: Login user
 *    description: 학생 로그인을 처리합니다.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: 학번
 *              password:
 *                type: string
 *                description: 비밀번호
 *    responses:
 *      '200':
 *        description: 학생 로그인 성공
 *        headers:
 *          Set-Cookie:
 *            description: response access token
 *            schema:
 *              type: string
 *              example: access_token="MKGMEQDPDAL"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 학생 학번
 *                name:
 *                  type: string
 *                  description: 학생 이름
 *      '201':
 *        description: 교수 로그인 성공
 *        headers:
 *          Set-Cookie:
 *            description: response access token
 *            schema:
 *              type: string
 *              example: access_token="MKGMEQDPDAL"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 교수 학번
 *                name:
 *                  type: string
 *                  description: 교수 이름
 *      '401':
 *        description: 로그인 실패
 */

router.post('/', async (req, res) =>{
    try{
        let id = req.body.id;
        let password = req.body.password;
        const [result] = await db.promise().query(`SELECT id, name, author FROM studenttable WHERE id = ? AND password = ?`, [id,password]);
        if(result.length > 0){
            const accesstoken = jwt.sign(result);
            res.cookie('accesstoken', accesstoken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true
                
            });
            const {author, ...info} = result[0];
            return res.status(200).send(info);
        }else{
            const [result2] = await db.promise().query(`SELECT id, name, author FROM professortable WHERE id = ? AND password = ?`, [id,password]);
            if(result2.length > 0){
                let accesstoken = jwt.sign(result2);
                res.cookie('accesstoken', accesstoken, {
                    httpOnly: true,
                    sameSite: 'none',
                });
                const {author, ...info} = result2[0];
                return res.status(201).send(info);
            } else{
                const [result3] = await db.promise().query(`SELECT id, name, author FROM admintable WHERE id = ? AND password = ?`, [id,password]);
                if(result3.length > 0){
                    let accesstoken = jwt.sign(result3);
                    res.cookie('accesstoken', accesstoken);
                    const {author, ...info} = result3[0];
                return res.status(202).send(info);
                } else{
                    return res.sendStatus(401);
                }
            }
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;