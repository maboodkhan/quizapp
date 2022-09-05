'use strict';

module.exports = function(Sections) {
    Sections.getActiveSections = function(data,cb){
        let msg = {};
               
        Sections.find({
            where:{
                and:
                [
                    {status:1}
                ]
            }
        },function(err,result){
            if(err){
                return cb(null, err);
                msg = {status:false,data:"Error! Please try again."};
                return cb(null,msg);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Sections.remoteMethod(
        'getActiveSections',
        {
            http: {path: '/getsections', verb: 'post'},
            description: 'Get Sections',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );


    Sections.getSectionById = function(data,cb){
        let msg = {};
        let section_id = (data.section_id==undefined || data.section_id==null || data.section_id==''?undefined:data.section_id);

        if(section_id == undefined ){
            msg = {status:false,message:"Please provide section id"};
            return cb(null, msg);
        }

        Sections.findOne({
            where: {
                id: section_id
            }
        }, function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Sections.remoteMethod(
        'getSectionById',
        {
            http: {path: '/getSectionById', verb: 'post'},
            description: 'Get school by id',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    );
};
