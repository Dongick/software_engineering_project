const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const score_funciton = require('../modules/score_function');

/**
 * @openapi
 * /grade_entry/{subjectID}/{semesterID}:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  get:
 *    summary: 성적 입력 페이지
 *    description: 성적 입력 페이지
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 성적 입력 페이지
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  semester:
 *                    type: string
 *                    description: 학기
 *                  sub_code:
 *                    type: string
 *                    description: 과목코드
 *                  sub_name:
 *                    type: string
 *                    description: 과목명
 *                  student_id:
 *                    type: integer
 *                    description: 학생 학번
 *                  student_name:
 *                    type: string
 *                    description: 학생 이름
 *                  grade:
 *                    type: string
 *                    description: 성적
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const [result] = await db.promise().query(`select s.semester, s.sub_code, s.name sub_name, e.student_id, st.name student_name, e.grade
            from enrollment e join studenttable st on e.student_id = st.id
            join subject s on s.sub_code = e.sub_code where s.sub_code = ? and s.semester = ? order by st.id`, [sub_code, semester]);
            return res.status(200).send(result);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /grade_entry/{subjectID}/{semesterID}:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  post:
 *    summary: 성적 입력
 *    description: 성적 입력
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              student_id:
 *                type: array
 *                description: 학번
 *                items:
 *                  type: integer
 *                  example: [2018202003, 2018202004, 2018202032]
 *              grade:
 *                type: array
 *                description: 성적
 *                items:
 *                  type: string
 *                  example: [A+, A, B+]
 *    responses:
 *      '200':
 *        description: 성적 입력 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const student_id = req.body.student_id;
            const grades = req.body.grade;
            for(let i = 0; i < student_id.length; i++){
                db.promise().query(`UPDATE enrollment SET grade = ? WHERE student_id = ? AND sub_code = ? AND semester = ?`, [grades[i], student_id[i], sub_code, semester]);
                let [result] = await db.promise().query(`select * from enrollment where student_id = ? and semester = ? and grade is null`, [student_id[i], semester]);
                if(result.length == 0){
                    let [score] = await db.promise().query(`select e.grade, sum(s.credit) sum_credit from enrollment e join subject s
                    on e.sub_code = s.sub_code and e.semester = s.semester 
                    where e.student_id = ? and s.semester = ?
                    group by e.student_id, e.semester, e.grade`, [student_id[i], semester]);
                    let totalCredit = score.reduce((acc, curr) => acc + parseInt(curr.sum_credit), 0);
                    let totalGrade = score.reduce((acc, curr) => acc + score_funciton.convert_grade(curr.grade) * parseInt(curr.sum_credit), 0);
                    let average_score = (totalGrade / totalCredit).toFixed(2);
                    const [info] = await db.promise().query(`select * from score where student_id = ? and semester = ?`, [student_id[i], semester]);
                    if(info.length > 0){
                        db.promise().query(`update score set average_score = ? where student_id = ? and semester = ?`, [average_score, student_id[i], semester]);
                    } else{
                        db.promise().query(`insert into score(student_id, semester, average_score) values(?, ?, ?)`, [student_id[i], semester, average_score]);
                    }
                }
            }
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;