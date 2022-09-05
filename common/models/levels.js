'use strict';

module.exports = function(Levels) {

    Levels.getLevel = function(req, cb) {
        let msg = {};
        
        Levels.find({

            where:{status:1}

        },function(err,result){
                if(err){
                    msg = {status:false,data:"Error! Please try again."};
                    return cb(null,msg);
                }
                msg = {status:true,data:result};
                return cb(null, msg);
            }
        );
    }


    Levels.remoteMethod(
        'getLevel',
        {
            http: {path: '/getLevel', verb: 'get'},
            description: 'get all levels list',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
        }
    )
};
