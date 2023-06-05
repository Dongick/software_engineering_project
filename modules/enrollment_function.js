const db = require('../config/db');
module.exports = {
    select_semester: async () => {
        try{
            let [result] = await db.promise().query(`select semester from subject order by semester desc limit 1`);
            result = result[0].semester;
            return result;
        }
        catch(err){
            throw err;
        }
    },
    select_courselist: async (result, semester, student_id) => {
        try{
            const [result2] = await db.promise().query(`select s.sub_code, s.name sub_name, s.credit, s.time, s.class, p.name professor_name, s.major_area, s.classification
                from enrollment e join subject s on e.sub_code = s.sub_code and e.semester = s.semester
                join professortable p on s.professor_id = p.id where s.semester = ? and e.student_id = ?`,
                [semester, student_id]
            );
            const total_result = {
                'sub_list': result,
                'enrollment_list': result2
            }
            return total_result;
        }
        catch(err){
            throw err;
        }
    },
    lecture_time: async(times) => {
        try{
            const TimesArr = []
            for(const timeArr of times){
                const weekday = timeArr[0];;
                const hoursStr = timeArr.slice(1);
                const numbers = hoursStr.split(',');
                for (const number of numbers) {
                    const hour = weekday + number;
                    TimesArr.push(hour);
                }
            }
            return TimesArr;
        }
        catch(err){
            throw err;
        }
    } 
}