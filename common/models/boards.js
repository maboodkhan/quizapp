'use strict';

module.exports = function(Boards) {
    Boards.createBoard = function(data, res, cb) {
        let msg = {};
        let board_name = (data.board_name == undefined || data.board_name == null || data.board_name == '')?undefined:data.board_name;
        if(board_name == undefined){
            msg = {status:false,message:"Please provide board name"};
            return cb(null, msg);
        }

        Boards.upsert(data,function(err,result){
            if(err){
                return cb(null, err);
            }
            msg = {status:true,data:result};
            return cb(null, msg);
        });
    }

    Boards.remoteMethod(
        'createBoard',
        {
            http: {path: '/create', verb: 'post'},
            description: 'Create/Update Board',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Boards.getBoards = function(data, res, cb) {
        let msg = {};
      
        let board_name = (data.board_name == undefined || data.board_name == null || data.board_name == '')?undefined:data.board_name;
        let non_academic = (data.non_academic == undefined || data.non_academic == null || data.non_academic == '')?0:data.non_academic;        
        let boardCond = {};
        if(board_name!=undefined){
            boardCond = {board_name:board_name};
        }
        Boards.find(
            {
                where:{
                    and:
                    [
                        {
                            or:[
                                {status:1}
                            ]
                        },
                        {non_academic:non_academic},
                        boardCond
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

    Boards.remoteMethod(
        'getBoards',
        {
            http: {path: '/getboards', verb: 'post'},
            description: 'Get all active boards',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Boards.getAllBoards = function(data, res, cb) {
        let msg = {};
        let board_name = (data.board_name == undefined || data.board_name == null || data.board_name == '')?undefined:data.board_name;
        let non_academic = (data.non_academic == undefined || data.non_academic == null || data.non_academic == '')?0:data.non_academic;       
        let boardCond = {};
        if(board_name!=undefined){
            boardCond = {board_name:board_name};
        }
        Boards.find(
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
                        boardCond
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

    Boards.remoteMethod(
        'getAllBoards',
        {
            http: {path: '/getallboards', verb: 'post'},
            description: 'Get all boards',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}},
                      {arg: 'res', type: 'object', http: {source: 'res'}}],
            returns: {root: true, type: 'json'}
        }
    );

    Boards.getBoard = function(req, cb) {
        let msg = {};
        let board_id = (req.params.board_id == undefined || req.params.board_id == null || req.params.board_id == '')?undefined:req.params.board_id;
        
        Boards.findOne(
            {
                where: {id:board_id}
                // id:board_id
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

    Boards.remoteMethod(
        'getBoard',
        {
            http: {path: '/getboard/:board_id', verb: 'get'},
            description: 'Get boards',
            accepts: [{arg: 'req', type: 'object', http: {source: 'req'}}],
            returns: {root: true, type: 'json'}
        }
    )

};
