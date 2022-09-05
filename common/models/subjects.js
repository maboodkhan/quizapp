'use strict';

module.exports = function(Subjects) {
    Subjects.createSubject = function(data, res, cb) {
        let msg = {};
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '')?undefined:data.class_id;
        let subject_name = (data.subject_name == undefined || data.subject_name == null || data.subject_name == '')?undefined:data.subject_name;

        if(class_id == undefined){
            msg = {status:false,message:"Please provide class id"};
            return cb(null, msg);
        }

        if(subject_name == undefined){
            msg = {status:false,message:"Please provide subject name"};
            return cb(null, msg);
        }

        Subjects.upsert(data,function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Subjects.remoteMethod(
        'createSubject',
        {
            http: {path: '/create', verb: 'post'},
            description: 'Create/Update Subject',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Subjects.getSubjects = function(data, res, cb) {
        let msg = {};
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length<1)?undefined:data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' || data.subject_id.length<1)?undefined:data.subject_id;
        let subjectCond = {};

        if(class_id == undefined){
            msg = {status:false,message:"Please provide class id"};
            return cb(null, msg);
        }

        if(subject_id!=undefined){
            subjectCond.id = {inq:subject_id}
        }
        Subjects.find(
            {
                where:{
                    and:
                    [
                        {
                            or:[
                                {status:1}
                            ]
                        },
                        {class_id:{inq:class_id}},
                        subjectCond
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

    Subjects.remoteMethod(
        'getSubjects',
        {
            http: {path: '/getsubjects', verb: 'post'},
            description: 'Get all active Subjects',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Subjects.getAllSubjects = function(data, res, cb) {
        let msg = {};
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '')?undefined:data.class_id;
        let subject_name = (data.subject_name == undefined || data.subject_name == null || data.subject_name == '')?undefined:data.subject_name;
        let subjectCond = {};

        if(class_id == undefined){
            msg = {status:false,message:"Please provide class id"};
            return cb(null, msg);
        }

        if(subject_name!=undefined){
            subjectCond = {subject_name:subject_name};
        }
        Subjects.find(
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
                        {class_id:class_id},
                        subjectCond
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

    Subjects.remoteMethod(
        'getAllSubjects',
        {
            http: {path: '/getallsubjects', verb: 'post'},
            description: 'Get all Subjects',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Subjects.getSubject = function(req, cb) {
        let msg = {};
        let subject_id = (req.params.subject_id == undefined || req.params.subject_id == null || req.params.subject_id == '')?undefined:req.params.subject_id;
        
        Subjects.findOne(
            {
                where: {id:subject_id}
                // id:subject_id
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

    Subjects.remoteMethod(
        'getSubject',
        {
            http: {path: '/getSubject/:subject_id', verb: 'get'},
            description: 'Get Subjects',
            accepts: [{arg: 'req', type: 'object', http: {source: 'req'}}],
            returns: {root: true, type: 'json'}
        }
    );
};
