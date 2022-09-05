'use strict';

module.exports = function(Lessons) {
    
    Lessons.getLessons = function(data, res, cb) {
        let msg = {};
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' || data.subject_id.length<1)?undefined:data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '')?undefined:data.lesson_name;
        let LessonCond = {};

        if(subject_id == undefined){
            msg = {status:false,message:"Please provide subject id"};
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
                        {subject_id:{inq:subject_id}},
                        LessonCond
                    ]
                },
                order: "lesson_num", 
                include:[{
                    relation: "subject_lessons",					
                    scope: {
                        where:{status:1},
                    }
                },
                {
                    relation: "class_lessons_mapping",					
                    scope: {
                        fields: ['lesson_id'],
                        where:{status:1},
                    }
                }]
            },function(err,result){
                if(err){
                    //return cb(null, err);
                    console.log(err);
                    msg = {status:false,data:"Error! Please try again."};
                    return cb(null,msg);
                }
                let lessons = [];
                result.forEach(res => {
                    let totalSubLesson = res.class_lessons_mapping.length
                    res.totalSubLesson = totalSubLesson;
                    lessons.push(res);

                });
                msg = {status:true,data:lessons};
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

    Lessons.getAllLessons = function(data, res, cb) {
        let msg = {};
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '')?undefined:data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '')?undefined:data.lesson_name;
        let LessonCond = {};

        if(subject_id == undefined){
            msg = {status:false,message:"Please provide subject id"};
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
                                {status:1},
                                {status:2}
                            ]
                        },
                        {subject_id:subject_id},
                        LessonCond
                    ]
                }
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
        'getAllLessons',
        {
            http: {path: '/getAllLessons', verb: 'post'},
            description: 'Get all Lessons',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Lessons.getLesson = function(req, cb) {
        let msg = {};
        let country_lesson_id = (req.params.country_lesson_id == undefined || req.params.country_lesson_id == null || req.params.country_lesson_id == '')?undefined:req.params.country_lesson_id;
        
        Lessons.findOne(
            {
                where: {id:country_lesson_id},
                include:[
                    {
                        relation: "subject_lessons",
                        scope: {
    
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
        'getLesson',
        {
            http: {path: '/getLesson/:lesson_id', verb: 'get'},
            description: 'Get Lessons',
            accepts: [{arg: 'req', type: 'object', http: {source: 'req'}}],
            returns: {root: true, type: 'json'}
        }
    );
};
