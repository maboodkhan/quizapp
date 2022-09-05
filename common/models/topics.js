'use strict';

module.exports = function (Topics) {
    Topics.createTopic = function (data, res, cb) {
        let msg = {};
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }

        if (topic_name == undefined) {
            msg = { status: false, message: "Please provide Topic name" };
            return cb(null, msg);
        }

        Topics.upsert(data, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Topics.remoteMethod(
        'createTopic',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create/Update Topic',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.getTopics = function (data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' || data.lesson_id.length < 1) ? undefined : data.lesson_id;
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;
        let topicCond = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        if (topic_name != undefined) {
            topicCond = { topic_name: topic_name };
        }
        Topics.find(
            {
                where: {
                    and:
                        [
                            {
                                or: [
                                    { status: 1 }
                                ]
                            },
                            { lesson_id: { inq: lesson_id } },
                            topicCond
                        ]
                }
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Topics.remoteMethod(
        'getTopics',
        {
            http: { path: '/gettopics', verb: 'post' },
            description: 'Get all active Topics',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.getAllTopics = function (data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;
        let topicCond = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        if (topic_name != undefined) {
            topicCond = { topic_name: topic_name };
        }
        Topics.find(
            {
                and:
                    [
                        {
                            or: [
                                { status: 1 },
                                { status: 2 }
                            ]
                        },
                        { subject_id: subject_id },
                        topicCond
                    ]
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Topics.remoteMethod(
        'getAllTopics',
        {
            http: { path: '/getalltopics', verb: 'post' },
            description: 'Get all Topics',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.getTopic = function (req, cb) {
        let msg = {};
        let topic_id = (req.params.topic_id == undefined || req.params.topic_id == null || req.params.topic_id == '') ? undefined : req.params.topic_id;

        Topics.findOne(
            {
                where: { id: topic_id }
                // id:topic_id
            }, function (err, result) {
                if (err) {
                    //return cb(null, err);
                    msg = { status: false, data: "Error! Please try again." };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    Topics.remoteMethod(
        'getTopic',
        {
            http: { path: '/getTopic/:topic_id', verb: 'get' },
            description: 'Get Topics',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.getTopicList = function (data, res, cb) {
        let msg = {};
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        Topics.find({
            where: {
                or: [{ status: 1 }, { status: 2 }]
            }
        }, function (err, res) {
            Topics.find({
                where: {
                    or: [{ status: 1 }, { status: 2 }]
                },
                skip: offset,
                limit: limit,
                include: [
                    {
                        relation: "lesson_topics",
                        scope: {
                            fields: ['lesson_name', 'subject_id'],
                            include: [
                                {
                                    relation: "subject_lessons",
                                    scope: {
                                        fields: ['subject_name', 'class_id'],
                                        include: [
                                            {
                                                relation: "class_subjects",
                                                scope: {
                                                    fields: ["class_name", "board_id"],
                                                    include: [
                                                        {
                                                            relation: "board_classes",
                                                            scope: {
                                                                fields: ["board_name"],

                                                            }
                                                        },
                                                    ]
                                                }
                                            },
                                        ]

                                    }
                                },
                            ]
                        }
                    }
                ]

            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                msg = { status: true, data: result, totalLesson: res.length };
                return cb(null, msg);
            });
        });
    }

    Topics.remoteMethod(
        'getTopicList',
        {
            http: { path: '/getTopicList', verb: 'post' },
            description: 'Get all content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

     //API for getting topics with search filter on sql
     Topics.getTopicListNew = function (data, res, cb) {
        let msg = {};
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Topics.dataSource;
        //console.log(data);
        let params;
        let cond = '';

        if(topic_name !== undefined) {
            cond = cond + " and ( t.topic_name like '%"+ topic_name +"%')";
        }

        if (board_id != undefined) {
            cond = cond + " and b.id IN(" + board_id.join() + ")";
        } 
    
        if (class_id !== undefined) {
            cond = cond + " and c.id IN(" + class_id.join() + ")";
        }

        if (subject_id != undefined) {
            cond = cond + " and s.id IN(" + subject_id.join() + ")";
        }

        
        if (lesson_id != undefined) {
            cond = cond + " and l.id IN(" + lesson_id.join() + ")";
        }

        if (status == undefined) {
            cond = cond + " and t.status IN(1,2)";
        } else {
            cond = cond + " and t.status = " + status;
        }

        var countSql =  `SELECT t.*, b.board_name, c.class_name, s.subject_name, l.lesson_name,
        c.id as class_id  FROM topics t
        JOIN lessons l on t.lesson_id = l.id 
        JOIN subjects s on l.subject_id = s.id
        JOIN classes c on s.class_id = c.id
        JOIN boards b on c.board_id = b.id
        where 1=1 ${cond}`

        var sql = `SELECT t.*, b.board_name, c.class_name, s.subject_name, l.lesson_name,
        c.id as class_id  FROM topics t 
        JOIN lessons l on t.lesson_id = l.id
        JOIN subjects s on l.subject_id = s.id
        JOIN classes c on s.class_id = c.id
        JOIN boards b on c.board_id = b.id
        where 1=1 ${cond} 
        ORDER BY c.id ASC
        LIMIT ${offset},${limit};`
        //console.log(sql);

        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, topicData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: topicData, totalTopic: count.length };
                return cb(null, msg);
            });
        });

    }

    
    Topics.remoteMethod(
        'getTopicListNew',
        {
            http: { path: '/getTopicListNew', verb: 'post' },
            description: 'Get all Topics',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.getTopicById = function (data, res, cb) {

        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let msg = {};

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }

        Topics.findOne({
            where: { id: topic_id },
            include: [
                {
                    relation: "lesson_topics",
                    scope: {
                        fields: ['lesson_name', 'subject_id'],
                        include: [
                            {
                                relation: "subject_lessons",
                                scope: {
                                    fields: ['subject_name', 'class_id'],
                                    include: [
                                        {
                                            relation: "class_subjects",
                                            scope: {
                                                fields: ["class_name", "board_id"],
                                                include: [
                                                    {
                                                        relation: "board_classes",
                                                        scope: {
                                                            fields: ["board_name"],

                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                    ]

                                }
                            },
                        ]
                    }
                }
            ]

        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Topics.remoteMethod(
        'getTopicById',
        {
            http: { path: '/getTopicById', verb: 'post' },
            description: 'Get lesson content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Topics.createNewTopic = function (data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;
        let topic_num = (data.topic_num == undefined || data.topic_num == null || data.topic_num == '') ? undefined : data.topic_num;
        let keywords = (data.keywords == undefined || data.keywords == null || data.keywords == '') ? undefined : data.keywords;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }
        if (topic_name == undefined) {
            msg = { status: false, message: "Please provide topic name" };
            return cb(null, msg);
        }
        if (topic_num == undefined) {
            msg = { status: false, message: "Please provide topic number" };
            return cb(null, msg);
        }
        if (keywords == undefined) {
            msg = { status: false, message: "Please provide keywords" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }
        let obj = {
            lesson_id: lesson_id,
            topic_name: topic_name,
            topic_num: topic_num,
            keywords: keywords,
            status: status,
            old_record_id: 0
        }

        // Topics.findOne({ where: { topic_name: topic_name } }, function (err, res) {
        //     if (res == null) {
                Topics.upsert(obj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
        //     }else{
        //         msg = { status: false, message: "Topic already available" };
        //         return cb(null, msg);
        //     }
        // });
        
    }

    Topics.remoteMethod(
        'createNewTopic',
        {
            http: { path: '/createNewTopic', verb: 'post' },
            description: 'Create New Topic',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Topics.updateTopic = function (data, res, cb) {
        let msg = {};
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '') ? undefined : data.topic_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let topic_name = (data.topic_name == undefined || data.topic_name == null || data.topic_name == '') ? undefined : data.topic_name;
        let topic_num = (data.topic_num == undefined || data.topic_num == null || data.topic_num == '') ? undefined : data.topic_num;
        let keywords = (data.keywords == undefined || data.keywords == null || data.keywords == '') ? undefined : data.keywords;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }
        if (topic_name == undefined) {
            msg = { status: false, message: "Please provide topic name" };
            return cb(null, msg);
        }
        if (topic_num == undefined) {
            msg = { status: false, message: "Please provide topic number" };
            return cb(null, msg);
        }
        if (keywords == undefined) {
            msg = { status: false, message: "Please provide keywords" };
            return cb(null, msg);
        }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }
        let obj = {
            lesson_id: lesson_id,
            topic_name: topic_name,
            topic_num: topic_num,
            keywords: keywords,
            status: status,
            modified_on: new Date(),
            old_record_id: 0
        }

        // Topics.findOne({ where: { topic_name: topic_name }, id: { neq: topic_id } }, function (err, res) {
        //     if (res == null) {
                Topics.upsertWithWhere({ id: topic_id }, obj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
        //     } else {
        //         msg = { status: false, message: "Topic already available" };
        //         return cb(null, msg);
        //     }
        // });
        
    }

    Topics.remoteMethod(
        'updateTopic',
        {
            http: { path: '/updateTopic', verb: 'post' },
            description: 'Create New Topic',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
