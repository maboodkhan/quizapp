'use strict';

module.exports = function (Userclasses) {

    Userclasses.getUserSchool = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 5 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }

        Userclasses.find(
            {
                where: { user_id: user_id },
                include: [
                    {
                        relation: "school",
                        scope: {
                            where: { status: 1 }
                        }
                    }
                ]
            }, function (err, userSchool) {
                if (err) {
                    msg = { status: false, message: err };
                    return cb(null, msg);
                }
                let school_id = [];
                userSchool.forEach((allSchool) => {
                    let userSchools = allSchool.toJSON();
                    JSON.stringify(userSchools);
                    school_id.push(userSchools.school.id);
                });

                let Schools = Userclasses.app.models.schools;

                Schools.find({
                    where: {
                        id: { inq: school_id },
                    }
                }, function (err, response) {
                    if (err) {
                        return cb(null, err);
                    }
                    Schools.find({
                        where: {
                            id: { inq: school_id },
                        }, order: 'school_name ASC', skip: offset, limit: limit
                    }, function (err, result) {
                        if (err) {
                            return cb(null, err);
                        }
                        msg = { status: true, data: result, total_school: response.length };
                        return cb(null, msg);
                    });
                });
            });
    }

    Userclasses.remoteMethod(
        'getUserSchool',
        {
            http: { path: '/getUserSchool', verb: 'post' },
            description: 'Get school list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userclasses.getUserClass = function (data, cb) {
        // console.log(data);
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 5 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }

        let class_id = [];
        var ds = Userclasses.dataSource;
        let params;

        var countSql = `select c.id from classes c 
        join user_classes uc on c.id = uc.class_id 
        and uc.school_id= ${school_id} and uc.user_id= ${user_id} 
        group by uc.class_id`

        var sql = `select c.id, c.class_name 
        from classes c 
        join user_classes uc on c.id = uc.class_id 
        and uc.school_id= ${school_id} and uc.user_id= ${user_id}
        group by uc.class_id
        ORDER BY c.created_on DESC LIMIT ${offset},${limit};`;

        // console.log(sql);
        ds.connector.query(countSql, params, function (err, countData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            ds.connector.query(sql, params, function (err, quizData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }

                quizData.forEach(qd => { class_id.push(qd.id); });

                let classSql = `select c.id, c.class_name
                from classes c 
                join user_data ud on c.id = ud.class_id and ud.school_id = ${school_id}
                where c.id IN (${class_id})
                group by ud.class_id`;
                // console.log(classSql);
                ds.connector.query(classSql, params, function (err, classData) {

                    // let countVal = 0;
                    let contentData = {};
                    contentData.status = true;
                    contentData.total_class = classData.length;
                    contentData.data = classData;
                    cb(null, contentData);
                });

                // console.log(quizData);

            });
        });

        // Userclasses.find(
        //     {
        //         where: { user_id: user_id, school_id: school_id },
        //         include: [
        //             {
        //                 relation: "class",
        //                 scope: {
        //                     where: { status: 1 }
        //                 }
        //             }
        //         ]
        //     }, function (err, userClass) {
        //         if (err) {
        //             msg = { status: false, message: err };
        //             return cb(null, msg);
        //         }

        //         let class_id = [];
        //         userClass.forEach((allClass) => {
        //             let userClasses = allClass.toJSON();
        //             JSON.stringify(userClasses);
        //             class_id.push(userClasses.class.id);
        //         });

        //         let Classes = Userclasses.app.models.classes;
        //         Classes.find({
        //             where: { id: { inq: class_id } }
        //         }, function (err, response) {
        //             if (err) {
        //                 msg = { status: false, data: "Error! Please try again." };
        //                 return cb(null, msg);
        //             }
        //             Classes.find({
        //                 where: { id: { inq: class_id } },
        //                 order: 'class_name ASC', skip: offset, limit: limit
        //             }, function (err, result) {
        //                 if (err) {
        //                     msg = { status: false, data: "Error! Please try again." };
        //                     return cb(null, msg);
        //                 }
        //                 msg = { status: true, data: result, total_class: response.length };
        //                 return cb(null, msg);
        //             });
        //         });
        //     });
    }

    Userclasses.remoteMethod(
        'getUserClass',
        {
            http: { path: '/getUserClass', verb: 'post' },
            description: 'Get class list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userclasses.getUserSection = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 5 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }

        Userclasses.find(
            {
                where: {
                    user_id: user_id,
                    school_id: school_id,
                    class_id: class_id
                },
            }, function (err, response) {
                if (err) {
                    msg = { status: false, message: err };
                    return cb(null, msg);
                }

                Userclasses.find(
                    {
                        where: {
                            user_id: user_id,
                            school_id: school_id,
                            class_id: class_id
                        },
                        skip: offset, limit: limit,
                        include: [
                            {
                                relation: "class_Section",
                                scope: {
                                    fields: ["id", "section_id"],
                                    where: { status: 1 },
                                    include: [
                                        {
                                            relation: "class_section",
                                            scope: {
                                                fields: ["id", "section_name"],
                                                where: { status: 1 }
                                                , order: 'section_name ASC',
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }, function (err, userSection) {
                        if (err) {

                        }
                        let result = [];
                        userSection.forEach((allSection) => {
                            let userSections = allSection.toJSON();
                            JSON.stringify(userSections);
                            result.push(userSections.class_Section);
                        });
                        // , total_section: response.length
                        msg = { status: true, data: result, total_section: response.length };
                        return cb(null, msg);
                    });
            }
        )


    }

    Userclasses.remoteMethod(
        'getUserSection',
        {
            http: { path: '/getUserSection', verb: 'post' },
            description: 'Get user section list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userclasses.userSchools = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }
        Userclasses.find({ where: { user_id: user_id } }, function (err, userSchool) {
            if (err) {
                msg = { status: false, message: err };
                return cb(null, msg);
            }
            let response = JSON.parse(JSON.stringify(userSchool));
            let school_id = [];
            let class_id = [];
            let section_id = [];
            response.forEach(element => {
                school_id.push(element.school_id);
                class_id.push(element.class_id);
                section_id.push(element.section_id);
            });
            school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
            class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
            section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
            let Schools = Userclasses.app.models.schools;
            // let Schools = Userclasses.app.models.schools;

            Schools.find({ where: { id: { inq: school_id } } }, function (err, schoolData) {
                if (err) { return cb(null, err); }

                // console.log(response);
                msg = { status: true, data: schoolData, userClass: class_id, userSection: section_id };
                return cb(null, msg);
            });
        });
    }

    Userclasses.remoteMethod(
        'userSchools',
        {
            http: { path: '/userSchools', verb: 'post' },
            description: 'Get school list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userclasses.userSchools1 = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }
        Userclasses.find({
            where: { user_id: user_id },
            include: [
                {
                    relation: "school",
                    scope: {
                        where: { status: 1 }
                    }
                },
                {
                    relation: "class",
                    scope: {
                        where: { status: 1 }
                    }
                },
                {
                    relation: "class_Section",
                    scope: {
                        where: { status: 1 },
                        include: [{
                            relation: "class_section",
                            scope: {
                                where: { status: 1 }
                            }
                        }]
                    }
                }
            ]
        }, function (err, userSchool) {
            if (err) {
                msg = { status: false, message: err };
                return cb(null, msg);
            }
            msg = { status: true, data: userSchool };
            return cb(null, msg);
        });
    }

    Userclasses.remoteMethod(
        'userSchools1',
        {
            http: { path: '/userSchools1', verb: 'post' },
            description: 'Get school list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userclasses.updateTrialSchool = function (data, cb) {
        // console.log(data);
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let trialSchoolId = (data.trialSchoolId == undefined || data.trialSchoolId == null || data.trialSchoolId == '' ? undefined : data.trialSchoolId);
        // let schoolId = (data.schoolId == undefined || data.schoolId == null || data.schoolId == '' ? undefined : data.schoolId);

        if (user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return cb(null,msg);
		}

        if (trialSchoolId == undefined) {
			msg.status = false;
			msg.message = "Please provide the trial school id";
			return cb(null,msg);
		}

        // if (schoolId == undefined) {
		// 	msg.status = false;
		// 	msg.message = "Please provide the school id";
		// 	return cb(null,msg);
		// }

        let schoolId = 7;
        // console.log(cond);
        Userclasses.update({ 
            school_id: trialSchoolId,
            user_id: user_id
        },
        {school_id: schoolId}
        ,function (err, res) {

            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            msg.status = true;
            msg.message = "Record updated successfully.";
            // console.log(msg);
            return cb(null, msg);
        });

    }

    Userclasses.remoteMethod(
        'updateTrialSchool',
        {
            http: { path: '/updateTrialSchool', verb: 'post' },
            description: 'Move user from Marksharks trial school to OKS School',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
