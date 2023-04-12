const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const enrollment_function = require('../modules/enrollment_function');

/**
 * @openapi
 * /enrollment:
 *  get:
 *    summary: 수강신청 강좌 목록
 *    description: 수강신청 강좌 목록
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 수강신청 목록 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                sub_name:
 *                  type: string
 *                  description: 과목이름
 *                credit:
 *                  type: string
 *                  description: 학점
 *                time:
 *                  type: string
 *                  description: 강의시간
 *                class:
 *                  type: string
 *                  description: 강의실
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                major_area:
 *                  type: string
 *                  description: 영역
 *                classification:
 *                  type: string
 *                  description: 이수 구분
 *                remain_seat:
 *                  type: string
 *                  description: 남은 좌석 수
 *                수강 신청 목록:
 *                  type: object
 *                  properties:
 *                    sub_code:
 *                      type: string
 *                      description: 과목코드
 *                    sub_name:
 *                      type: string
 *                      description: 과목이름
 *                    credit:
 *                      type: string
 *                      description: 학점
 *                    time:
 *                      type: string
 *                      description: 강의시간
 *                    class:
 *                      type: string
 *                      description: 강의실
 *                    professor_name:
 *                      type: string
 *                      description: 교수이름
 *                    major_area:
 *                      type: string
 *                      description: 영역
 *                    classification:
 *                      type: string
 *                      description: 이수 구분
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const semester = await enrollment_function.select_semester();
            const [result] = await db.promise().query(`select s.sub_code, s.name sub_name, s.credit, s.time, s.class, p.name professor_name, s.major_area, s.classification, s.remain_seat
            from subject s join professortable p on s.professor_id = p.id where s.semester = ?`, [semester]);
            const total_result = await enrollment_function.select_courselist(result, semester, token.id);
            return res.status(200).send(total_result);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /enrollment/insert:
 *  post:
 *    summary: 수강신청 강의 추가
 *    description: 해당하는 강의를 수강 목록에 추가
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              sub_code:
 *                type: string
 *                description: 과목코드
 *    responses:
 *      '200':
 *        description: 강의 추가 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 *      '409':
 *        description: 강의시간 중복
 *      '413':
 *        description: 학점 초과(18학점)
 *      '400':
 *        description: 과목명 중복
 *      '403':
 *        description: 여석 부족
 */

router.post('/insert', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.body.sub_code;
            const semester = await enrollment_function.select_semester();
            const [result] = await db.promise().query(`select remain_seat, credit, time from subject where sub_code = ? and semester = ?`, [sub_code, semester]);
            let[{remain_seat, credit, time}] = result;
            if(remain_seat > 0){
                let [same_subject] = await db.promise().query(`select sub_code from enrollment where sub_code = ? and semester = ?`, [sub_code, semester]);
                if(same_subject.length == 0){
                    let [total_credit] = await db.promise().query(`select sum(s.credit) total_credit from subject s join enrollment e
                    on s.sub_code = e.sub_code and s.semester = e.semester where e.student_id = ? and s.semester = ?`, [token.id, semester]);
                    total_credit = parseInt(total_credit[0].total_credit);
                    if(total_credit + credit < 18){
                        let [times] = await db.promise().query(`select s.time from enrollment e join subject s on s.sub_code = e.sub_code and s.semester = e.semester
                        where e.student_id = ? and s.semester = ?`, [token.id, semester]);
                        times = times.map(item => item.time.split(',')).flat();
                        time = time.split(',');
                        for(const value of time){
                            if(times.includes(value)){
                                return res.sendStatus(409);
                            }
                        }
                        db.promise().query(`update subject set remain_seat = ? - 1 where sub_code = ? and semester = ?`, [remain_seat, sub_code, semester]);
                        db.promise().query(`insert into enrollment(sub_code, student_id, semester) values(?,?,?)`, [sub_code, token.id, semester]);
                        return res.sendStatus(200);
                    } else{
                        return res.sendStatus(413);
                    }
                } else{
                    return res.sendStatus(400);
                }
            } else{
                return res.sendStatus(403);
            }
            
        }
    }
    catch(err){
        throw err
    }
})

/**
 * @openapi
 * /enrollment/delete:
 *  post:
 *    summary: 수강신청 강의 추가
 *    description: 해당하는 강의를 수강 목록에 추가
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              sub_code:
 *                type: string
 *                description: 과목코드
 *    responses:
 *      '200':
 *        description: 강의 삭제 성공
 */

router.post('/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.body.sub_code;
            const semester = await enrollment_function.select_semester();
            db.promise().query(`delete from enrollment where student_id = ? and sub_code = ? and semester = ?`, [token.id, sub_code, semester]);
            let [remain_seat] = await db.promise().query(`select remain_seat from subject where sub_code = ? and semester = ?`, [sub_code, semester]);
            remain_seat = remain_seat[0].remain_seat;
            db.promise().query(`update subject set remain_seat = ? + 1 where sub_code = ? and semester = ?`, [remain_seat, sub_code, semester]);
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err
    }
})

/**
 * @openapi
 * /enrollment:
 *  post:
 *    summary: 조건에 맞는 수강신청 강좌 목록
 *    description: 조건에 맞는 수강신청 강좌 목록
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              sub_name:
 *                type: string
 *                description: 과목명
 *              major_area:
 *                type: string
 *                description: 영역
 *    responses:
 *      '200':
 *        description: 조건에 맞는 수강신청 목록 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                sub_name:
 *                  type: string
 *                  description: 과목이름
 *                credit:
 *                  type: string
 *                  description: 학점
 *                time:
 *                  type: string
 *                  description: 강의시간
 *                class:
 *                  type: string
 *                  description: 강의실
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                major_area:
 *                  type: string
 *                  description: 영역
 *                classification:
 *                  type: string
 *                  description: 이수 구분
 *                remain_seat:
 *                  type: string
 *                  description: 남은 좌석 수
 *                수강 신청 목록:
 *                  type: object
 *                  properties:
 *                    sub_code:
 *                      type: string
 *                      description: 과목코드
 *                    sub_name:
 *                      type: string
 *                      description: 과목이름
 *                    credit:
 *                      type: string
 *                      description: 학점
 *                    time:
 *                      type: string
 *                      description: 강의시간
 *                    class:
 *                      type: string
 *                      description: 강의실
 *                    professor_name:
 *                      type: string
 *                      description: 교수이름
 *                    major_area:
 *                      type: string
 *                      description: 영역
 *                    classification:
 *                      type: string
 *                      description: 이수 구분
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
            const sub_name = req.body.sub_name;
            const major_area = req.body.major_area;
            const semester = await enrollment_function.select_semester();
            let result;
            if(sub_name.length == 0){
                [result] = await db.promise().query(`select s.name sub_name, s.credit, s.sub_code, s.semester, s.time, s.class, p.name professor_name, s.major_area, s.classification, s.remain_seat
                from subject s join professortable p on s.professor_id = p.id where s.major_area = ? and s.semester = ?`, [major_area, semester]);
            } else{
                if(major_area.length == 0){
                    [result] = await db.promise().query(`select s.name sub_name, s.credit, s.sub_code, s.semester, s.time, s.class, p.name professor_name, s.major_area, s.classification, s.remain_seat
                    from subject s join professortable p on s.professor_id = p.id where s.name like ? and s.semester = ?`, [`%${sub_name}%`, semester]);
                } else{
                    [result] = await db.promise().query(`select s.name sub_name, s.credit, s.sub_code, s.semester, s.time, s.class, p.name professor_name, s.major_area, s.classification, s.remain_seat
                    from subject s join professortable p on s.professor_id = p.id where s.name like ? and s.major_area = ? and s.semester = ?`, [`%${sub_name}%`, major_area, semester]);
                }
            }
            const total_result = await enrollment_function.select_courselist(result, semester, token.id);
            return res.status(200).send(total_result);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;