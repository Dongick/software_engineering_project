const db = require('../config/db');

module.exports = {
    select_student_all_semester: async (id) => {
        try{
            const [all_semester] = await db.promise().query(`select semester from enrollment where student_id = ?
                group by semester order by semester desc`, [id]
            );
            return all_semester;
        }
        catch(err){
            throw err;
        }
    },
    select_professor_all_semester: async (id) =>{
        try{
            const [all_semester] = await db.promise().query(`select semester from subject where professor_id = ?
                group by semester order by semester desc`, [id]
            );
            return all_semester;
        }
        catch(err){
            throw err;
        }
    },
    select_student_schedule: async (id, semester) =>{
        try{
            const [schedule] = await db.promise().query(`select sub.sub_code, sub.name sub_name, sub.time, sub.class, p.name professor_name 
                from enrollment e join subject sub on e.sub_code = sub.sub_code and e.semester = sub.semester
                join professortable p on p.id = sub.professor_id where e.student_id = ? and e.semester = ?`, [id, semester]
            );
            return schedule;
        }
        catch(err){
            throw err;
        }
    },
    select_professor_schedule: async (id, semester) =>{
        try{
            const [schedule] = await db.promise().query(`select sub_code, name, time, class
                from subject where professor_id = ? and semester = ?`, [id, semester]
            );
            return schedule;
        }
        catch(err){
            throw err;
        }
    },
    select_subject_notice: async (id, semester) => {
        try{
            const [subject_notice] = await db.promise().query(`select date_format(updated_time, '%Y-%m-%d') date, category, name, title
                from (select updated_time, '공지사항' as category, name, title from notice n join enrollment e on n.sub_code = e.sub_code and n.semester = e.semester
                join subject s on e.sub_code = s.sub_code and e.semester = s.semester where e.student_id = ? and e.semester = ?
                union all
                select updated_time, '강의자료실' as category, name, title from lecture_material l join enrollment e on l.sub_code = e.sub_code and l.semester = e.semester
                join subject s on e.sub_code = s.sub_code and e.semester = s.semester where e.student_id = ? and e.semester = ?)
                as a order by updated_time desc limit 5`, [id, semester, id, semester]
            );
            return subject_notice;
        }
        catch(err){
            throw err;
        }
    }
}