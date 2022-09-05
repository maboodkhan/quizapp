'use strict';

module.exports = function (Questionpreviousdata) {

    Questionpreviousdata.getPreviousData = function (data, res, cb) {
        let msg = {};
        let question_id = (data.question_id == undefined || data.question_id == null || data.question_id == '') ? undefined : data.question_id;

        if (question_id == undefined) {
            msg = { status: false, message: "Please provide question id" };
            return cb(null, msg);
        }

        Questionpreviousdata.find({where: {question_id: question_id}}, function (err, result) {
                if (err) {
                    console.log(err);
                    return cb(null, err);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Questionpreviousdata.remoteMethod(
        'getPreviousData',
        {
            http: { path: '/getPreviousData', verb: 'post' },
            description: 'Get active questions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );
};
