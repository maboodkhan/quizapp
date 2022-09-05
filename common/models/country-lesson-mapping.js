'use strict';

module.exports = function(Lessons) {

    Lessons.getLessons = function(data, res, cb) {
        let msg = {};
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '' || data.country_lesson_id.length<1)?undefined:data.country_lesson_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '')?undefined:data.lesson_name;
        let LessonCond = {};
        if(country_lesson_id == undefined){
            msg = {status:false,message:"Please provide country lesson id"};
            return cb(null, msg);
        }

        if(lesson_name!=undefined){
            LessonCond = {lesson_name:lesson_name};
        }
        Lessons.find(
            {
                where:{
                    and:
                    [
                        {
                            or:[
                                {status:1}
                            ]
                        },
                        {country_lesson_id:{inq:country_lesson_id}},
                        LessonCond
                    ]
                },
                order: "lesson_num", 
                include:[
                    {
                        relation: "country_lessons",					
                        scope: {
                            where:{status:1},
                            include:[
                                {
                                    relation: "subject_lessons",
                                    scope: {
                
                                    }
                                }
                            ]
                        }
                    },
                    {
                        relation: "country_map_lessons",
                        scope: {
                            where: {status: 1}
                        }
                    }
                ]
            },function(err,result){
                if(err){
                    //return cb(null, err);                
                    msg = {status:false,data:"Error! Please try again."};
                    return cb(null,msg);
                }
                msg = {status:true,data:result};
                return cb(null, msg);
            }
        );
    }

    Lessons.remoteMethod(
        'getLessons',
        {
            http: {path: '/getlessons', verb: 'post'},
            description: 'Get all active Lessons',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Lessons.getMapCountryLessons = function(data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '')?undefined:data.lesson_id;

        if(lesson_id == undefined){
            msg = {status:false,message:"Please provide lesson id"};
            return cb(null, msg);
        }
        Lessons.findOne( { where:{lesson_id:lesson_id } },function(err,result){
                if(err){
                    msg = {status:false,data:"Error! Please try again."};
                    return cb(null,msg);
                }
                msg = {status:true,data:result};
                return cb(null, msg);
            }
        );
    }

    Lessons.remoteMethod(
        'getMapCountryLessons',
        {
            http: {path: '/getMapCountryLessons', verb: 'post'},
            description: 'Get all active Lessons',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );
};
