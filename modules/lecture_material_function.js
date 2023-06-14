const db = require('../config/db');

module.exports = {
    select_lecture_materialfile: async (lecture_material_id) => {
        try{
            const [result] = await db.promise().query(`select JSON_ARRAYAGG(file_name) file_name
                from lecture_material_file where lecture_material_id = ?`, [lecture_material_id]
            );
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_lecture_material: async (lecture_material_uniqueid) =>{
        try{
            const [result] = await db.promise().query(`select content from lecture_material where id = ?`, [lecture_material_uniqueid]);
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_lecture_materialid: async (semester, sub_code, lecture_materialid) =>{
        try{
            const [lecture_material_id] = await db.promise().query(`select id
                from lecture_material where semester = ? and sub_code = ? order by updated_time limit ?,1`,
                [semester,sub_code,lecture_materialid]
            );
            const result = lecture_material_id[0].id;
            return result;
        }
        catch(err){
            throw err;
        }
    },
    insert_lecture_materialfile: async (lecture_material_id, file_info) =>{
        try{
            const values = file_info.map(([name, data]) => [lecture_material_id, name, data]);
            await db.promise().query(`insert into lecture_material_file(lecture_material_id, file_name, file_data) values ?;`,[values]);
        }
        catch(err){
            throw err;
        }
    },
    lecture_material_info: async (lecture_material, file) => {
        try{
            if(file){
                const result = {
                    'lecture_material': lecture_material,
                    'file': file
                };
                return result;
            }else{
                const result = {
                    'lecture_material': lecture_material,
                };
                return result;
            }
        }
        catch(err){
            throw err;
        }
    }
}