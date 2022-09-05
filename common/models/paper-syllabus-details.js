'use strict';

module.exports = function (Quizsyllabusdetails) {

    Quizsyllabusdetails.getActiveQuizSets = function (data, cb) {
        let msg = {};
        let set_name = (data.set_name == undefined || data.set_name == null || data.set_name == '' ? undefined : data.set_name);
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);

        Quizsyllabusdetails.find({
            where: {
                and:
                    [
                        { id: set_id },
                        { set_name: set_name },
                        { board_id: board_id },
                        { class_id: class_id },
                        { subject_id: subject_id },
                        { lesson_id: lesson_id },
                        { topic_id: topic_id },
                        { status: 1 }
                    ]
            },
            include: [
                {
                    relation: "quiz_syllabus",
                    scope: {
                        where: {
                            status: 1
                        }
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
                msg = { status: false, data: "Error! Please try again." };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Quizsyllabusdetails.remoteMethod(
        'getActiveQuizSets',
        {
            http: { path: '/getquizsets', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizsyllabusdetails.getActiveQuizSetDetails = function (set_id, cb) {
        let msg = {};
        //let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);

        if (set_id == undefined) {
            msg = { status: false, message: "Please provide set id" };
            return cb(null, msg);
        }

        Quizsyllabusdetails.findOne({
            where: {
                and:
                    [
                        { id: set_id },
                        { status: 1 }
                    ]
            },
            include: [
                {
                    relation: "quiz_syllabus",
                    scope: {
                        where: {
                            status: 1
                        }
                    }
                },
                {
                    relation: "quiz_questions",
                    scope: {
                        where: {
                            status: 1
                        },
                        include: [
                            {
                                relation: "quiz_question",
                                scope: {
                                    where: { status: 1 },
                                    include: [
                                        {
                                            relation: "ansoptions",
                                            scope: {
                                                fields: ["id", "answer"],
                                                where: { status: 1 }
                                            }
                                        },
                                        {
                                            relation: "rightansoption",
                                            scope: {
                                                fields: ["id", "answer_id"],
                                                where: { status: 1 },
                                                include: [
                                                    {
                                                        relation: "right_ans",
                                                        scope: {
                                                            fields: ["id", "answer"],
                                                            where: { status: 1 }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
                msg = { status: false, data: "Error! Please try again." };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Quizsyllabusdetails.remoteMethod(
        'getActiveQuizSetDetails',
        {
            http: { path: '/getquizsetdetails', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'set_id', type: 'number', required: true }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizsyllabusdetails.getQuizSetClassInfo = function (data, cb) {
        let msg = {};
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);

        if (quiz_set_id == undefined) {
            msg = { status: false, message: "Please provide quiz set id" };
            return cb(null, msg);
        }

        Quizsyllabusdetails.find({
            where: {
                and:
                    [
                        { quiz_set_id: quiz_set_id },
                        { status: 1 }
                    ]
            },
            fields: ["id", "class_id"],
            include: [
                {
                    relation: "quiz_class",
                    scope: {
                        where: {
                            status: 1
                        }
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }


    Quizsyllabusdetails.remoteMethod(
        'getQuizSetClassInfo',
        {
            http: { path: '/getquizsetClassInfo', verb: 'post' },
            description: 'Get Quiz Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizsyllabusdetails.getQuizSetSectionInfo = function (data, cb) {
        let msg = {};
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 0 ? undefined : data.class_id);
        var ds = Quizsyllabusdetails.dataSource;
        let params;

        if (quiz_set_id == undefined) {
            msg = { status: false, message: "Please provide quiz set id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }
        class_id = class_id.join();
        var sql = `SELECT qsd.section_id, qsd.class_id, c.class_name, s.section_name FROM quiz_syllabus_details qsd 
        join class_sections cs on qsd.section_id = cs.id
        join classes c on c.id = qsd.class_id
        join sections s on s.id = cs.section_id
        where qsd.quiz_set_id = ${quiz_set_id} and c.id IN(${class_id})
        group by qsd.class_id, qsd. section_id`

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            cb(null, quizData);
        });
    }


    Quizsyllabusdetails.remoteMethod(
        'getQuizSetSectionInfo',
        {
            http: { path: '/getQuizSetSectionInfo', verb: 'post' },
            description: 'Get Quiz Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
