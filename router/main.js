const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const main_function = require('../modules/main_function');

/**
 * @openapi
 * /main:
 *  get:
 *    summary: 로그인 직후 메인화면
 *    description: 로그인 직후 메인화면
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 로그인 직후 메인화면
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 수강한 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      semester:
 *                        type: string
 *                        description: 학기
 *                semester:
 *                  type: string
 *                  description: 현재 학기
 *                schedule:
 *                  type: array
 *                  description: 시간표
 *                  items:
 *                    type: object
 *                    properties:
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      name:
 *                        type: string
 *                        description: 과목명
 *                      time:
 *                        type: string
 *                        description: 수업 시간
 *                      class:
 *                        type: string
 *                        description: 강의실
 *                      professor_name:
 *                        type: string
 *                        description: 교수명
 *                subject_notice:
 *                  type: array
 *                  description: 최근 공지사항 or 강의자료실
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 날짜
 *                      category:
 *                        type: string
 *                        description: 공지사항 or 강의자료실
 *                      name:
 *                        type: string
 *                        description: 과목명
 *                      title:
 *                        type: string
 *                        description: 제목
 *      '201':
 *        description: 교수일 때 로그인 직후 메인화면
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 담당한 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      semester:
 *                        type: string
 *                        description: 학기
 *                semester:
 *                  type: string
 *                  description: 현재 학기
 *                schedule:
 *                  type: array
 *                  description: 시간표
 *                  items:
 *                    type: object
 *                    properties:
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      sub_name:
 *                        type: string
 *                        description: 과목명
 *                      time:
 *                        type: string
 *                        description: 수업 시간
 *                      class:
 *                        type: string
 *                        description: 강의실
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const userid = token.id;
            if(token.author == 1){
                const all_semester = await main_function.select_student_all_semester(userid);
                const semester = all_semester[0].semester;
                const schedule = await main_function.select_student_schedule(userid, semester);
                const subject_notice = await main_function.select_subject_notice(userid, semester);
                const result = {
                    "all_semester": all_semester,
                    "semester": semester,
                    "schedule": schedule,
                    "subject_notice": subject_notice
                };
                return res.status(200).send(result);
            } else{
                const all_semester = await main_function.select_professor_all_semester(userid);
                const semester = all_semester[0].semester;
                const schedule = await main_function.select_professor_schedule(userid, semester);
                const result = {
                    "all_semester": all_semester,
                    "semester": semester,
                    "schedule": schedule
                };
                return res.status(201).send(result);
            }
        }
    }
    catch(err){
        throw err;
    }
    
});

/**
 * @openapi
 * /main:
 *  post:
 *    summary: 학기를 선택했을 때의 메인화면
 *    description: 학기를 선택했을 때의 메인화면
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              semester:
 *                type: string
 *                description: 학기
 *    responses:
 *      '200':
 *        description: 학생일 때 학기를 선택한 메인화면
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 수강한 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      semester:
 *                        type: string
 *                        description: 학기
 *                semester:
 *                  type: string
 *                  description: 선택한 학기
 *                schedule:
 *                  type: array
 *                  description: 시간표
 *                  items:
 *                    type: object
 *                    properties:
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      sub_name:
 *                        type: string
 *                        description: 과목명
 *                      time:
 *                        type: string
 *                        description: 수업 시간
 *                      class:
 *                        type: string
 *                        description: 강의실
 *                      professor_name:
 *                        type: string
 *                        description: 교수명
 *                subject_notice:
 *                  type: array
 *                  description: 최근 공지사항 or 강의자료실
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 날짜
 *                      category:
 *                        type: string
 *                        description: 공지사항 or 강의자료실
 *                      name:
 *                        type: string
 *                        description: 과목명
 *                      title:
 *                        type: string
 *                        description: 제목
 *      '201':
 *        description: 교수일 때 학기를 선택한 메인화면
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 담당한 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      semester:
 *                        type: string
 *                        description: 학기
 *                semester:
 *                  type: string
 *                  description: 선택한 학기
 *                schedule:
 *                  type: array
 *                  description: 시간표
 *                  items:
 *                    type: object
 *                    properties:
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      sub_name:
 *                        type: string
 *                        description: 과목명
 *                      time:
 *                        type: string
 *                        description: 수업 시간
 *                      class:
 *                        type: string
 *                        description: 강의실
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const userid = token.id;
            const semester = req.body.semester;
            if(token.author == 1){
                const all_semester = await main_function.select_student_all_semester(userid);
                const schedule = await main_function.select_student_schedule(userid, semester);
                const subject_notice = await main_function.select_subject_notice(userid, semester);
                const result = {
                    "all_semester": all_semester,
                    "semester": semester,
                    "schedule": schedule,
                    "subject_notice": subject_notice
                }
                return res.status(200).send(result);
            } else{
                const all_semester = await main_function.select_professor_all_semester(userid);
                const schedule = await main_function.select_professor_schedule(userid, semester);
                const result = {
                    "all_semester": all_semester,
                    "semester": semester,
                    "schedule": schedule
                };
                return res.status(201).send(result);
            }
        }
    }
    catch(err){
        throw err;
    }
    
});

module.exports = router;