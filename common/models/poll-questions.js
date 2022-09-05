'use strict';

module.exports = function (Pollquestions) {

    Pollquestions.getPollQuestions = function (data, cb) {
        let msg = {};
        Pollquestions.find({
            where: { status: 1 },
            include: [{
                relation: "ansOptions",
                scope: { 
                    fields: ['id','answer', 'answerVal'],
                    where: { status: 1 } 
                }
            }]
        }, function (err, result){
            msg = {status: true, data: result}
            return cb(null, msg);
        });
    }

    Pollquestions.remoteMethod(
        'getPollQuestions',
        {
            http: { path: '/getPollQuestions', verb: 'post' },
            description: 'Delete Schedule',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
};
