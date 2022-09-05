'use strict';

module.exports = function (Classsections) {

    Classsections.getClassSections = function (data, cb) {
        let msg = {};
        let cond = {}
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if(class_id!=undefined){
            cond.class_id = {inq:class_id}
        }

        if(section_id!=undefined){
            cond.id = {inq:section_id}
        }
        Classsections.find(
            {
                where: cond,
                include: [
                    {
                        relation: "class_section",
                        scope: {
                            where: { status: 1 }
                        }
                    },
                    {
                        relation: "class_detail",
                        scope: {
                            fields:["id","class_name"],
                            where: { status: 1 }
                        }
                    }
                ]

            }, function (err, result) {
                if (err) {
                    console.log(err)
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Classsections.remoteMethod(
        'getClassSections',
        {
            http: { path: '/getClassSections', verb: 'post' },
            description: 'Get Sections',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Classsections.getSectionList = function(data,cb){
        let msg = {};
        let limit = (data.limit==undefined || data.limit==null || data.limit==''?10:data.limit);
        let offset = (data.offset==undefined || data.offset==null || data.offset==''?0:data.offset);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        
        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        Classsections.find({
            where: { class_id: class_id}
        },function(err,response){
            if(err){
                return cb(null, err);
            }
            
            Classsections.find({
                where: { class_id: class_id},
                fields:["id","section_id"],
                include: [
                    {
                        relation: "class_section",
                        scope: {
                            fields:["id","section_name"],
                            where: { status: 1 },
                            order: 'section_name ASC',
                        }
                    }
                ],
                skip: offset, limit: limit},function(err,result){
                if(err){
                    return cb(null, err);
                }
                msg = {status:true,data:result, total_section: response.length};
                return cb(null, msg);
            });
        });
    }

    Classsections.remoteMethod(
        'getSectionList',
        {
            http: {path: '/getSectionList', verb: 'post'},
            description: 'Get Sections',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );


    Classsections.getSection = function(data,cb){
        let msg = {};
        let section_id = (data.section_id==undefined || data.section_id==null || data.section_id==''?undefined:data.section_id);

        if(section_id == undefined ){
            msg = {status:false,message:"Please provide section id"};
            return cb(null, msg);
        }

        Classsections.findOne({
            where: {
                id: section_id
            },
            include: [
                {
                    relation: "class_section",
                    scope: {
                        fields:["id","section_name"],
                        where: { status: 1 }
                    }
                }
            ],
        }, function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Classsections.remoteMethod(
        'getSection',
        {
            http: {path: '/getSection', verb: 'post'},
            description: 'Get school by id',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );

};
