const db = require('../config/db');

module.exports = {
    select_noticefile: async (notice_id) => {
        try{
            const [result] = await db.promise().query(`select JSON_ARRAYAGG(file_name) as file_name
                from notice_file where notice_id = ?`, [notice_id]
            );
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_notice: async (notice_id) =>{
        try{
            const [result] = await db.promise().query(`select content from notice where id = ?`, [notice_id]);
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_noticeid: async (semester, sub_code, noticeid) =>{
        try{
            const [notice_id] = await db.promise().query(`select id
                from notice where semester = ? and sub_code = ? order by updated_time limit ?,1`,
                [semester,sub_code,noticeid]
            );
            const result = notice_id[0].id;
            return result;
        }
        catch(err){
            throw err;
        }
    },
    insert_noticefile: async (notice_id, file_info) =>{
        try{
            const values = file_info.map(([name, data]) => [notice_id, name, data]);
            await db.promise().query(`insert into notice_file(notice_id, file_name, file_data) values ?;`,[values]);
        }
        catch(err){
            throw err;
        }
    },
    notice_info: async (notice, file) => {
        try{
            if(file){

                const result = {
                    'notice': notice,
                    'file': file
                };
                return result;
            }else{
                const result = {
                    'notice': notice,
                };
                return result;
            }
        }
        catch(err){
            throw err;
        }
    }
}