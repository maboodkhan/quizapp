'use strict';
const request = require("request");

module.exports = function (Wizenoze) {

    Wizenoze.getWizenozeboard = function (req, cb) {
        request.get({
            "url": "https://api.wizenoze.com/v4/curriculum?userUUID=123456&sessionUUID=123456&userType=teacher",
            "headers": {
                "Authorization": "6bc9c661-cd70-4d40-961a-de65192d379d"
            },
        }, function (err, res) {
            if (JSON.parse(res.body).exception) {
                return cb(null, JSON.parse(res.body).exception);
            } else {
                let response = JSON.parse(res.body);
                return cb(null, response);
            }
        });
    }

    Wizenoze.remoteMethod(
        'getWizenozeboard',
        {
            http: { path: '/getWizenozeboard', verb: 'get' },
            description: 'Get Wizenoze boards',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    )

    Wizenoze.getWizenozeClass = function (req, cb) {
        let msg = {};
        let board_id = (req.params.board_id == undefined || req.params.board_id == null || req.params.board_id == '')?undefined:req.params.board_id;
        if(board_id == undefined){
            msg = {status:false,message:"Please provide board id"};
            return cb(null, msg);
        }

        request.get({
            "url": "https://api.wizenoze.com/v4/curriculum/"+board_id+"/layers/GRADE?userUUID=123456&sessionUUID=123456&userType=teacher",
            "headers": {
                "Authorization": "6bc9c661-cd70-4d40-961a-de65192d379d"
            },
        }, function (err, res) {
            if (JSON.parse(res.body).exception) {
                return cb(null, JSON.parse(res.body).exception);
            } else {
                let response = JSON.parse(res.body);
                return cb(null, response);
            }
        });
    }

    Wizenoze.remoteMethod(
        'getWizenozeClass',
        {
            http: { path: '/getWizenozeClass/:board_id', verb: 'get' },
            description: 'Get Wizenoze Class',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    )


    Wizenoze.getWizenozeCurriculum = function (req, cb) {
        let msg = {};
        let class_id = (req.params.class_id == undefined || req.params.class_id == null || req.params.class_id == '')?undefined:req.params.class_id;
        let user_id = (req.params.user_id == undefined || req.params.user_id == null || req.params.user_id == '')?undefined:req.params.user_id;
        let userType = (req.params.userType == undefined || req.params.userType == null || req.params.userType == '')?undefined:req.params.userType;
        let session_id = (req.params.session_id == undefined || req.params.session_id == null || req.params.session_id == '')?undefined:req.params.session_id;
        if(class_id == undefined){
            msg = {status:false,message:"Please provide class id"};
            return cb(null, msg);
        }

        if(user_id == undefined){
            msg = {status:false,message:"Please provide user id"};
            return cb(null, msg);
        }

        // if(userType == undefined){
        //     msg = {status:false,message:"Please provide user type"};
        //     return cb(null, msg);
        // }

        request.get({
            "url": "https://api.wizenoze.com/v4/curriculum/node/"+class_id+"/layers/SUBJECT/UNIT/TOPIC/QUERY?userUUID="+user_id+"&sessionUUID="+session_id+"&userType=teacher",
            "headers": {
                "Authorization": "6bc9c661-cd70-4d40-961a-de65192d379d"
            },
        }, function (err, res) {
            if (JSON.parse(res.body).exception) {
                return cb(null, JSON.parse(res.body).exception);
            } else {
                let response = JSON.parse(res.body);
                return cb(null, response);
            }
        });
    }

    Wizenoze.remoteMethod(
        'getWizenozeCurriculum',
        {
            http: { path: '/getWizenozeCurriculum/:class_id/:user_id', verb: 'get' },
            description: 'Get Wizenoze Class',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    )

    Wizenoze.getWizenozeTitle = function (req, cb) {
        let msg = {};
        let topic_id = (req.params.topic_id == undefined || req.params.topic_id == null || req.params.topic_id == '')?undefined:req.params.topic_id;
        if(topic_id == undefined){
            msg = {status:false,message:"Please provide topic id"};
            return cb(null, msg);
        }

        request.get({
            "url": "https://api.wizenoze.com/v4/curriculum/node/query/"+topic_id+"/results?userUUID=123456&sessionUUID=123456&userType=teacher&resultSize=100",
            "headers": {
                "Authorization": "6bc9c661-cd70-4d40-961a-de65192d379d"
            },
        }, function (err, res) {
            if (JSON.parse(res.body).exception) {
                return cb(null, JSON.parse(res.body).exception);
            } else {
                let response = JSON.parse(res.body);
                return cb(null, response);
            }
        });
    }

    Wizenoze.remoteMethod(
        'getWizenozeTitle',
        {
            http: { path: '/getWizenozeTitle/:topic_id', verb: 'get' },
            description: 'Get Wizenoze Class',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    )

};
