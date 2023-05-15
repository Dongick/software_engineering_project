const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /grade:
 *  get:
 *    summary: 성적 조회
 *    description: 성적 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 성적 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                student_info:
 *                  type: object
 *                  description: 학생 정보
 *                  properties:
 *                    school_name:
 *                      type: string
 *                      description: 학교이름
 *                    major:
 *                      type: string
 *                      description: 학과
 *                    student_id:
 *                      type: integer
 *                      description: 학번
 *                    student_name:
 *                      type: string
 *                      description: 학생이름
 *                credit_info:
 *                  type: object
 *                  description: 학점 정보
 *                  properties:
 *                    major_credit:
 *                      type: integer
 *                      description: 신청 전공 학점
 *                    general_credit:
 *                      type: integer
 *                      description: 신청 교양 학점
 *                    total_credit:
 *                      type: integer
 *                      description: 신청 전체 학점
 *                    get_major_credit:
 *                      type: integer
 *                      description: 취득 전공 학점
 *                    get_general_credit:
 *                      type: integer
 *                      description: 취득 교양 학점
 *                    get_total_credit:
 *                      type: integer
 *                      description: 취득 전체 학점
 *                average_score:
 *                  type: number
 *                  description: 전체 평균 성적
 *                sub_info:
 *                  type: array
 *                  description: 과목 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      semester:
 *                        type: string
 *                        description: 학기
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      sub_name:
 *                        type: string
 *                        description: 과목명
 *                      major_area:
 *                        type: string
 *                        description: 과목영역
 *                      classification:
 *                        type: string
 *                        description: 구분
 *                      credit:
 *                        type: integer
 *                        description: 학점
 *                      grade:
 *                        type: string
 *                        description: 성적
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
            const student_info_promise = db.promise().query(`select school_name, major, id student_id, name student_name from studenttable where id = ?`, [token.id]);
            const result_promise = db.promise().query(`select s.semester, s.sub_code, s.name sub_name, s.major_area, s.classification, s.credit, e.grade
            from subject s join enrollment e on s.semester = e.semester and s.sub_code = e.sub_code where e.student_id = ? order by s.semester desc, s.sub_code desc`, [token.id]);
            const credit_info_promise = db.promise().query(`select sum(case when s.classification like '전%' then s.credit else 0 end) as major_credit,
            sum(case when s.classification like '교%' then s.credit else 0 end) as general_credit,
            sum(s.credit) total_credit,
            sum(case when s.classification like '전%' and e.grade is not null then s.credit else 0 end) as get_major_credit,
            sum(case when s.classification like '교%' and e.grade is not null then s.credit else 0 end) as get_general_credit, 
            sum(case when e.grade is not null then s.credit else 0 end) as get_total_credit
            from enrollment e join subject s on e.sub_code = s.sub_code and e.semester = s.semester
            where e.student_id = ?`, [token.id]);
            const semesters_promise = db.promise().query(`select s.semester from enrollment e join score s
            on e.semester = s.semester and e.student_id = s.student_id where s.student_id = ? group by s.semester`, [token.id]);
            const score_promise = semesters_promise.then((semesters) => {
                return db.promise().query(`select sum(sub.credit) sum_credit, s.average_score
                from subject sub join enrollment e
                on sub.semester = e.semester and sub.sub_code = e.sub_code
                join score s on s.student_id = e.student_id and s.semester = e.semester
                where e.student_id = ? and s.semester in (?)
                group by s.student_id, s.semester`, [token.id, semesters[0].map((s) => s.semester)])
            });

            const [[student_info], [result], [credit_info], [score]] = await Promise.all([
                student_info_promise, result_promise, credit_info_promise, score_promise
            ]);
            const totalCredit = score.reduce((acc, curr) => acc + parseInt(curr.sum_credit), 0);
            const totalGrade = score.reduce((acc, curr) => acc + parseFloat(curr.average_score) * parseInt(curr.sum_credit), 0);
            const average_score = (totalGrade / totalCredit).toFixed(2);
            const major_credit = parseInt(credit_info[0].major_credit);
            const general_credit = parseInt(credit_info[0].general_credit);
            const total_credit = parseInt(credit_info[0].total_credit);
            const get_major_credit = parseInt(credit_info[0].get_major_credit);
            const get_general_credit = parseInt(credit_info[0].get_general_credit);
            const get_total_credit = parseInt(credit_info[0].get_total_credit);
            const total_result = {
            studnet_info: student_info[0],
                credit_info: {
                    major_credit,
                    general_credit,
                    total_credit,
                    get_major_credit,
                    get_general_credit,
                    get_total_credit
                },
                average_score: parseFloat(average_score),
                sub_info: result
            };
            return res.status(200).send(total_result);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;