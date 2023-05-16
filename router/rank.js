const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /grade:
 *  get:
 *    summary: 석차 조회
 *    description: 석차 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 석차 조회 성공
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
 *                total_student:
 *                  type: integer
 *                  description: 학생 이름
 *                aveage_score:
 *                  type: number
 *                  description: 학점 평균
 *                rank:
 *                  type: integer
 *                  description: 등수
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
            const [student_info] = await db.promise().query(`select school_name, major, id student_id, name student_name from studenttable where id = ?`, [token.id]);
            const [semester] = await db.promise().query(`select e.semester from enrollment e group by e.semester
                having count(*) = (select count(*) from enrollment en where en.grade is not null and en.semester = e.semester) order by e.semester desc limit 1`
            );
            const last_semester = semester.map((s) => s.semester)
            const [total_student] = await db.promise().query(`select count(distinct student_id) total_student from enrollment where semester = ?`, [last_semester]);
            const [rank_info] = await db.promise().query(`select student_id, average_score
                from score where semester = ? order by average_score desc`, [last_semester]
            );
            let rank = 1;
            const infos = rank_info.map((r) => [r.student_id, r.average_score]);
            for(info of infos){
                if(info[0] == token.id){
                    const total_result = {
                        'student_info': student_info[0],
                        'total_student': total_student[0].total_student,
                        'aveage_score': parseFloat(info[1]),
                        'rank': rank
                    };
                    return res.status(200).send(total_result);
                } else{
                    rank += 1;
                }
            }
        }
    }
    catch(err){
        throw err;
    }
})



module.exports = router;