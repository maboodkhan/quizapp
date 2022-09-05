'use strict';
const path = require('path');

module.exports = function (Questionqclogs) {

    Questionqclogs.questionLogs = function (data, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question_id." };
            return cb(null, msg);
        }

        Questionqclogs.find({
            where: { question_id: question_id },
            order: "created_on desc",
            include: [
                {
                    relation: "user",
                    scope: {
                        fields: ["id", "username"]
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questionqclogs.remoteMethod(
        'questionLogs',
        {
            http: { path: '/questionLogs', verb: 'post' },
            description: ' Get question logs',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
};