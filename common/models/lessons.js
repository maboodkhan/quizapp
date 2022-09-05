'use strict';

module.exports = function (Lessons) {
    Lessons.createLesson = function (data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        if (lesson_name == undefined) {
            msg = { status: false, message: "Please provide Lesson name" };
            return cb(null, msg);
        }

        Lessons.upsert(data, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Lessons.remoteMethod(
        'createLesson',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create/Update Lesson',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Lessons.getLessons = function (data, res, cb) {
        let msg = {};
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' || data.subject_id.length < 1) ? undefined : data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;
        let LessonCond = {};

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }

        if (lesson_name != undefined) {
            LessonCond = { lesson_name: lesson_name };
        }
        Lessons.find(
            {
                where: {
                    and:
                        [
                            {
                                or: [
                                    { status: 1 }
                                ]
                            },
                            { subject_id: { inq: subject_id } },
                            LessonCond
                        ]
                },
                order: "lesson_num",
                include: [{
                    relation: "subject_lessons",
                    scope: {
                        where: { status: 1 },
                    }
                }]
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

    Lessons.remoteMethod(
        'getLessons',
        {
            http: { path: '/getlessons', verb: 'post' },
            description: 'Get all active Lessons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Lessons.getAllLessons = function (data, res, cb) {
        let msg = {};
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;
        let LessonCond = {};

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }

        if (lesson_name != undefined) {
            LessonCond = { lesson_name: lesson_name };
        }
        Lessons.find(
            {
                where: {
                    and:
                        [
                            {
                                or: [
                                    { status: 1 },
                                    { status: 2 }
                                ]
                            },
                            { subject_id: subject_id },
                            LessonCond
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

    Lessons.remoteMethod(
        'getAllLessons',
        {
            http: { path: '/getAllLessons', verb: 'post' },
            description: 'Get all Lessons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Lessons.getLesson = function (req, cb) {
        let msg = {};
        let lesson_id = (req.params.lesson_id == undefined || req.params.lesson_id == null || req.params.lesson_id == '') ? undefined : req.params.lesson_id;

        Lessons.findOne(
            {
                where: { id: lesson_id },
                include: [
                    {
                        relation: "subject_lessons",
                        scope: {

                        }
                    }
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

    Lessons.remoteMethod(
        'getLesson',
        {
            http: { path: '/getLesson/:lesson_id', verb: 'get' },
            description: 'Get Lessons',
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { root: true, type: 'json' }
        }
    );

    // API for getting all the lessons list
    Lessons.getLessonsList = function (data, res, cb) {
        let msg = {};
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Lessons.dataSource;
        //console.log(data);
        let params;
        let cond = '';

        if(lesson_name !== undefined) {
            cond = cond + " and ( l.lesson_name like '%"+ lesson_name +"%')";
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

        if (status == undefined) {
            cond = cond + " and l.status IN(1,2)";
        } else {
            cond = cond + " and l.status = " + status;
        }

        var countSql =  `SELECT l.*, c.class_name, s.subject_name,
        c.id as class_id  FROM lessons l 
        JOIN subjects s on l.subject_id = s.id
        JOIN classes c on s.class_id = c.id
        JOIN boards b on c.board_id = b.id
        where 1=1 ${cond}`

        var sql = `SELECT l.*, c.class_name, s.subject_name,
        c.id as class_id  FROM lessons l 
        JOIN subjects s on l.subject_id = s.id
        JOIN classes c on s.class_id = c.id
        JOIN boards b on c.board_id = b.id
        where 1=1 ${cond} 
        ORDER BY c.id ASC
        LIMIT ${offset},${limit};`
        //console.log(sql);

        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, lessonData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: lessonData, totalLesson: count.length };
                return cb(null, msg);
            });
        });

    }

    Lessons.remoteMethod(
        'getLessonsList',
        {
            http: { path: '/getLessonsList', verb: 'post' },
            description: 'Get all lessons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    // API for creating new lesson 
    Lessons.createNewLesson = function (data, res, cb) {
        let msg = {};
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;
        let lesson_num = (data.lesson_num == undefined || data.lesson_num == null || data.lesson_num == '') ? undefined : data.lesson_num;
        let keywords = (data.keywords == undefined || data.keywords == null || data.keywords == '') ? undefined : data.keywords;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let bg_image = (data.bg_image == undefined || data.bg_image == null || data.bg_image == '') ? undefined : data.bg_image;

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }
        if (lesson_name == undefined) {
            msg = { status: false, message: "Please provide lesson name" };
            return cb(null, msg);
        }
        if (lesson_num == undefined) {
            msg = { status: false, message: "Please provide lesson number" };
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
            subject_id: subject_id,
            lesson_name: lesson_name,
            lesson_num: lesson_num,
            keywords: keywords,
            status: status,
            old_record_id: 0,
            bg_image: bg_image
        }
        // Lessons.findOne({ where: { lesson_name: lesson_name } }, function (err, res) {
        //     if (res == null) {
                Lessons.upsert(obj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
        //     } else {
        //         msg = { status: false, message: "Lesson already available" };
        //         return cb(null, msg);
        //     }
        // })
    }

    Lessons.remoteMethod(
        'createNewLesson',
        {
            http: { path: '/createNewLesson', verb: 'post' },
            description: 'Create New Lesson',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    // API for updating an existing lesson

    Lessons.updateLesson = function (data, res, cb) {
        let msg = {};
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_name = (data.lesson_name == undefined || data.lesson_name == null || data.lesson_name == '') ? undefined : data.lesson_name;
        let lesson_num = (data.lesson_num == undefined || data.lesson_num == null || data.lesson_num == '') ? undefined : data.lesson_num;
        let keywords = (data.keywords == undefined || data.keywords == null || data.keywords == '') ? undefined : data.keywords;
        let old_record_id = (data.old_record_id == undefined || data.old_record_id == null || data.old_record_id == '') ? undefined : data.old_record_id;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let bg_image = (data.bg_image == undefined || data.bg_image == null || data.bg_image == '') ? undefined : data.bg_image;

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }
        if (lesson_name == undefined) {
            msg = { status: false, message: "Please provide lesson name" };
            return cb(null, msg);
        }
        if (lesson_num == undefined) {
            msg = { status: false, message: "Please provide lesson number" };
            return cb(null, msg);
        }
        // if (keywords == undefined) {
        //     msg = { status: false, message: "Please provide keywords" };
        //     return cb(null, msg);
        // }
        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        let obj = {
            subject_id: subject_id,
            lesson_name: lesson_name,
            lesson_num: lesson_num,
            keywords: keywords,
            status: status,
            old_record_id: old_record_id,
            modified_on: new Date(),
            bg_image: bg_image,
        }

        // Lessons.findOne({ where: { lesson_name: lesson_name, id: { neq: lesson_id } } }, function (err, res) {
        //     if (res == null) {
                Lessons.upsertWithWhere({ id: lesson_id }, obj, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
        //     } else {
        //         msg = { status: false, message: "Lesson already available" };
        //         return cb(null, msg);
        //     }
        // })
    }

    Lessons.remoteMethod(
        'updateLesson',
        {
            http: { path: '/updateLesson', verb: 'post' },
            description: 'Update Lesson',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    // API for Getting Lesson By ID
    Lessons.getLessonsById = function (data, res, cb) {

        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let msg = {};

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        Lessons.findOne({
            where: { id: lesson_id },
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

    Lessons.remoteMethod(
        'getLessonsById',
        {
            http: { path: '/getLessonsById', verb: 'post' },
            description: 'Get lesson content',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
