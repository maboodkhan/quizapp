'use strict';

module.exports = function(Classes) {
    Classes.createClass = function(data, res, cb) {
        let msg = {};
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '')?undefined:data.board_id;
        let class_name = (data.class_name == undefined || data.class_name == null || data.class_name == '')?undefined:data.class_name;

        if(board_id == undefined){
            msg = {status:false,message:"Please provide board id"};
            return cb(null, msg);
        }

        if(class_name == undefined){
            msg = {status:false,message:"Please provide class name"};
            return cb(null, msg);
        }

        Classes.upsert(data,function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Classes.remoteMethod(
        'createClass',
        {
            http: {path: '/create', verb: 'post'},
            description: 'Create/Update Class',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Classes.getClasses = function(data, res, cb) {
        let msg = {};
        
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' || data.board_id.length<1)?undefined:data.board_id;
        let class_name = (data.class_name == undefined || data.class_name == null || data.class_name == '')?undefined:data.class_name;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '')?undefined:data.class_id;
        let classCond = {};

        if(board_id == undefined){
            msg = {status:false,message:"Please provide board id"};
            return cb(null, msg);
        }

        if(class_name!=undefined){
            classCond = {class_name:class_name};
        }
        if(class_id!=undefined){
            classCond.id = {inq:class_id}
        }
        Classes.find(
            {
                where:{
                    and:
                    [
                        {
                            or:[
                                {status:1}
                            ]
                        },
                        {board_id:board_id},
                        classCond
                    ]
                }
            },function(err,result){
                if(err){
                    //return cb(null, err);
                    console.log(err);
                    msg = {status:false,data:"Error! Please try again."};
                    return cb(null,msg);
                }
                msg = {status:true,data:result};
                return cb(null, msg);
            }
        );
    }

    Classes.remoteMethod(
        'getClasses',
        {
            http: {path: '/getclasses', verb: 'post'},
            description: 'Get all active classes',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Classes.getAllClasses = function(data, res, cb) {
        let msg = {};
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '')?undefined:data.board_id;
        let class_name = (data.class_name == undefined || data.class_name == null || data.class_name == '')?undefined:data.class_name;
        let classCond = {};

        if(board_id == undefined){
            msg = {status:false,message:"Please provide board id"};
            return cb(null, msg);
        }

        if(class_name!=undefined){
            classCond = {class_name:class_name};
        }
        Classes.find(
            {
                where: {
                    and:
                    [
                        {
                            or:[
                                {status:1},
                                {status:2}
                            ]
                        },
                        {board_id:board_id},
                        classCond
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

    Classes.remoteMethod(
        'getAllClasses',
        {
            http: {path: '/getallclasses', verb: 'post'},
            description: 'Get all Classes',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Classes.getClass = function(req, cb) {
        let msg = {};
        let class_id = (req.params.class_id == undefined || req.params.class_id == null || req.params.class_id == '')?undefined:req.params.class_id;
        
        Classes.findOne(
            {
                where: {id:class_id}
                
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

    Classes.remoteMethod(
        'getClass',
        {
            http: {path: '/getClass/:class_id', verb: 'get'},
            description: 'Get Classes',
            accepts: [{arg: 'req', type: 'object', http: {source: 'req'}}],
            returns: {root: true, type: 'json'}
        }
    );




    Classes.getClassList = function(data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let limit = (data.limit==undefined || data.limit==null || data.limit==''?10:data.limit);
        let offset = (data.offset==undefined || data.offset==null || data.offset==''?0:data.offset);
        
        var ds = Classes.dataSource;
        let params;

        var countSql = `select c.id
        from classes c 
        join user_data ud on c.id = ud.class_id and ud.school_id= ${school_id}
        group by ud.class_id`

        var sql = `select c.id, c.class_name 
        from classes c 
        join user_data ud on c.id = ud.class_id and ud.school_id= ${school_id}
        group by ud.class_id
        ORDER BY c.created_on DESC LIMIT ${offset},${limit};`;

        ds.connector.query(countSql, params, function (err, countData) {
            if(err){
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null,msg);
            }
            ds.connector.query(sql, params, function (err, quizData) {
                if(err){
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null,msg);
                }   
                let countVal = 0;                
                if(countData.length>0){
                    countVal = countData.length;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_class = countVal;
                contentData.data = quizData;          
                //console.log(contentData);
                cb(null,contentData);
            });
        });

        // Classes.find({},function(err,response){
        //     if(err){
        //         msg = {status:false,data:"Error! Please try again."};
        //         return cb(null,msg);
        //     }

        //     Classes.find({
        //         skip: offset,
        //         limit: limit
        //     },function(err,result){
        //         if(err){
        //             msg = {status:false,data:"Error! Please try again."};
        //             return cb(null,msg);
        //         }
        //         msg = {status:true,data:result, total_class: response.length};
        //         return cb(null, msg);
        //     });            
        // }
    // );
        
        
    }

    Classes.remoteMethod(
        'getClassList',
        {
            http: {path: '/getClassList', verb: 'post'},
            description: 'Get Classes',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );
    
};
