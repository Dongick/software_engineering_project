const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /grade/{subjectID}/{semesterID}:
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
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                semester:
 *                  type: string
 *                  description: 학기
 *                sub_name:
 *                  type: string
 *                  description: 과목명
 *                student_id:
 *                  type: integer
 *                  description: 학생 학번
 *                student_name:
 *                  type: string
 *                  description: 학생 이름
 *                grade:
 *                  type: string
 *                  description: 성적
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
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
 * /grade/{subjectID}/{semesterID}:
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
 *    description: 성적 입력력
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
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
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const student_id = req.body.student_id;
            const grades = req.body.grade;
            const info = student_id.map((id, index) => {
                return {
                    grade: grades[index],
                    sub_code: sub_code,
                    semester: semester,
                    id: id
                };
            });
            const promise = info.map(({ grade, sub_code, semester, id }) =>{
                return db.promise().query(`UPDATE enrollment SET grade = ? WHERE student_id = ? AND sub_code = ? AND semester = ?`, [grade, id, sub_code, semester]);
            })
            Promise.all(promise)
                .then(() => console.log('성적이 업데이트되었습니다.'))
                .catch((err) => console.error('업데이트 중 오류가 발생했습니다:', err));
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;