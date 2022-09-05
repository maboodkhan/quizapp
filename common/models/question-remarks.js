'use strict';

module.exports = function (Questionremarks) {

    Questionremarks.getRemark = function (data, cb) {
        let question_id = (data.question_id == '', data.question_id == null, data.question_id == undefined) ? undefined : data.question_id;
        let msg = {};
        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question_id." };
            return cb(null, msg);
        }
        Questionremarks.find({
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
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questionremarks.remoteMethod(
        'getRemark',
        {
            http: { path: '/getRemark', verb: 'post' },
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    )


    Questionremarks.addRemark = function (data, cb) {
        let msg = {}
        let user_id = (data.user_id == '', data.user_id == null, data.user_id == undefined) ? undefined : data.user_id;
        let question_id = (data.question_id == '', data.question_id == null, data.question_id == undefined) ? undefined : data.question_id;
        let remarks = (data.remarks == '', data.remarks == null, data.remarks == undefined) ? undefined : data.remarks;

        let obj = {
            question_id: question_id,
            remarks: remarks,
            created_by: user_id
        }
        Questionremarks.upsert(obj, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Questionremarks.remoteMethod(
        'addRemark',
        {
            http: { path: '/addRemark', verb: 'post' },
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    )
};
