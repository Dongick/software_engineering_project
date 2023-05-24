const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /main:
 *  get:
 *    summary: 강의 세부정보
 *    description: 강의 세부정보
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생 강의 세부정보
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      수강 학기:
 *                        type: array
 *                        description: 학기별 과목
 *                        items:
 *                          type: object
 *                          properties:
 *                            sub_name:
 *                              type: string
 *                              description: 과목명
 *                            sub_code:
 *                              type: string
 *                              description: 과목코드
 *                            professor_name:
 *                              type: string
 *                              description: 담당교수명
 *                notice:
 *                  type: array
 *                  description: 해당 과목의 최근 공지사항
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 공지사항 최종 수정 날짜
 *                      title:
 *                        type: string
 *                        description: 공지사항 제목
 *                lecture_material:
 *                  type: array
 *                  description: 해당 과목의 최근 강의자료
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 강의자료 최종 수정 날짜
 *                      title:
 *                        type: string
 *                        description: 강의자료 제목
 *      '201':
 *        description: 교수 강의 세부정보
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all_semester:
 *                  type: array
 *                  description: 전체 학기
 *                  items:
 *                    type: object
 *                    properties:
 *                      수강 학기:
 *                        type: array
 *                        description: 학기별 과목
 *                        items:
 *                          type: object
 *                          properties:
 *                            sub_name:
 *                              type: string
 *                              description: 과목명
 *                            sub_code:
 *                              type: string
 *                              description: 과목코드
 *                notice:
 *                  type: array
 *                  description: 해당 과목의 최근 공지사항
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 공지사항 최종 수정 날짜
 *                      title:
 *                        type: string
 *                        description: 공지사항 제목
 *                lecture_material:
 *                  type: array
 *                  description: 해당 과목의 최근 강의자료
 *                  items:
 *                    type: object
 *                    properties:
 *                      date:
 *                        type: string
 *                        description: 강의자료 최종 수정 날짜
 *                      title:
 *                        type: string
 *                        description: 강의자료 제목
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
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;

            const [notice] = await db.promise().query(`select date_format(updated_time, '%Y-%m-%d') date, title
                    from notice  where semester = ? and sub_code = ?
                    order by updated_time desc limit 5`, [semester, sub_code]
                );
            const [lecture_material] = await db.promise().query(`select date_format(updated_time, '%Y-%m-%d') date, title
                from lecture_material  where semester = ? and sub_code = ?
                order by updated_time desc limit 5`, [semester, sub_code]
            );
            const result = {
                all_semester: [],
                "notice": notice,
                "lecture_material": lecture_material
            };
            if(token.author == 1){
                const [semesters] = await db.promise().query(`select semester from enrollment where student_id = ? group by semester order by semester desc`, [token.id]);
                for(let i = 0; i < semesters.length; i++){
                    const [subjects] = await db.promise().query(`select sub.semester, sub.name sub_name, e.sub_code, p.name professor_name from subject sub
                        join enrollment e on sub.semester = e.semester and sub.sub_code = e.sub_code 
                        join professortable p on sub.professor_id = p.id where e.student_id = ? and e.semester = ?`,
                        [token.id, semesters[i].semester]
                    );
                    const semester_subject = {
                        [semesters[i].semester]: subjects.map(({sub_name, sub_code, professor_name}) => ({sub_name, sub_code, professor_name}))
                    };
                    console.log(semester_subject);
                    result.all_semester.push(semester_subject);
                }
                return res.status(200).send(result);

            } else{
                const [semesters] = await db.promise().query(`select semester from subject where professor_id = ? group by semester order by semester desc`, [token.id]);
                for(let i = 0; i < semesters.length; i++){
                    const [subjects] = await db.promise().query(`select semester, name sub_name, sub_code from subject where professor_id = ? and semester = ?`,
                        [token.id, semesters[i].semester]
                    );
                    const semester_subject = {
                        [semesters[i].semester]: subjects.map(({sub_name, sub_code}) => ({sub_name, sub_code}))
                    };
                    result.all_semester.push(semester_subject);
                }
                return res.status(201).send(result);
            }
        }
    }
    catch(err){
        throw err;
    }
});

module.exports = router;