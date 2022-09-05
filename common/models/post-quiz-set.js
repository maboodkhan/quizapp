'use strict';
const request = require("request");
const Mixpanel = require('mixpanel');
const SETTINGS = require('../../server/system-config');

module.exports = function (Quizset) {
    Quizset.createQuizSet = function (data, cb) {
        let msg;
        let set_id = (data.id == undefined || data.id == null || data.id == '' ? undefined : data.id);
        let set_name = (data.set_name == undefined || data.set_name == null || data.set_name == '' ? undefined : data.set_name.trim());
        let num_ques = (data.num_ques == undefined || data.num_ques == null || data.num_ques == '' ? undefined : data.num_ques);
        let duration = (data.duration == undefined || data.duration == null || data.duration == '' ? undefined : data.duration);
        let set_type = (data.set_type == undefined || data.set_type == null || data.set_type == '' ? undefined : data.set_type);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);

        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let questions = (data.questions == undefined || data.questions == null || data.questions == '' || data.questions.length < 1 ? undefined : data.questions);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? 0 : data.school_id);
        let testName = (data.testName == undefined || data.testName == null || data.testName == '' ? undefined : data.testName);
        let testType = (data.testType == undefined || data.testType == null || data.testType == '' ? undefined : data.testType);
        let score = (data.score == undefined || data.score == null || data.score == '' ? 0 : data.score);
        let timeSpent = (data.timeSpent == undefined || data.timeSpent == null || data.timeSpent == '' ? 0 : data.timeSpent);
        let liferayHeader = (data.headerVal == undefined || data.headerVal == null || data.headerVal == '' ? 0 : data.headerVal);
        let createdOn = new Date();
        data.created_on = createdOn;
        let quiz_type = (data.quiz_type == undefined || data.quiz_type == null || data.quiz_type == '' ? 'post' : data.quiz_type);

        if (set_name == undefined) {
            msg = { status: false, message: "Please provide set name" };
            return cb(null, msg);
        }

        if (board_id == undefined) {
            msg = { status: false, message: "Please provide board id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id" };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id" };
            return cb(null, msg);
        }

        if (questions == undefined) {
            msg = { status: false, message: "Please provide questions" };
            return cb(null, msg);
        }

        if (questions.length > num_ques) {

            msg = { status: false, message: "You've selected more than " + num_ques + " questions. Please select only " + num_ques + " questions." };
            return cb(null, msg);
        }

        if (questions.length < num_ques) {
            msg = { status: false, message: "Please select " + num_ques + " questions." };
            return cb(null, msg);
        }

        let cond = {};
        if (set_id !== undefined) {
            cond = { id: { neq: set_id }, set_name: set_name };
        } else {
            cond = { set_name: set_name };
        }

        Quizset.count(cond, async function (err, countData) {
            if (err) {
                console.log(err);
                msg = { status: false, message: "Error! Please try again." };
                return cb(null, msg);
            }
            if (countData < 1) {
                try {
                    let topicLessonId;
                    let lessonSubjectId;
                    let subjectClassId;
                    let classBoardId;
                    let quiz_syllabus_path;
                    topic_id = topic_id.filter((v, i, a) => a.indexOf(v) === i);
                    lesson_id = lesson_id.filter((v, i, a) => a.indexOf(v) === i);
                    subject_id = subject_id.filter((v, i, a) => a.indexOf(v) === i);
                    class_id = subject_id.filter((v, i, a) => a.indexOf(v) === i);
                    if (class_id.length > 1) {
                        quiz_syllabus_path = "CBSE >> Multiple Classes";
                    } else if (subject_id.length > 1) {
                        subjectClassId = await getSubjectDetails(subject_id[0]);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        quiz_syllabus_path = "CBSE >> " + classBoardId.class_name + " >> Multiple Subjects";
                    } else if (lesson_id.length > 1) {
                        lessonSubjectId = await getLessonDetails(lesson_id[0]);
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        quiz_syllabus_path = "CBSE >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> Multiple Lessons";
                    } else if (topic_id.length > 1) {
                        topicLessonId = await getTopicDetails(topic_id[0]);
                        lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        quiz_syllabus_path = "CBSE >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.lesson_name + " >> Multiple Topics";
                    } else {
                        topicLessonId = await getTopicDetails(topic_id[0]);
                        lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        quiz_syllabus_path = "CBSE >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.lesson_name + " >> " + topicLessonId.topic_name;
                    }

                    if(testType !== undefined){ //If submitted from web post test
                        // classBoardId = await getClassDetails(subjectClassId.class_id);
                        // lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        // subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        // topicLessonId = await getTopicDetails(topic_id[0]);
                        let userDataVal = await userDetails(data.user_id, subjectClassId.class_id);
                        let deviceId = userDataVal[0].deviceId;
                        let panelData = {
                            subjectName: subjectClassId.subject_name,
                            subjectId: subjectClassId.id,
                            lessonId: lessonSubjectId.id,
                            lessonName: lessonSubjectId.lesson_name,
                            lessonNum: lessonSubjectId.lesson_num,
                            testName: testName,
                            testType: testType,
                            TestScore: score,
                            timeSpent: timeSpent,
                            classId: classBoardId.id,
                            deviceId: deviceId,
                            distinct_id: data.user_id
                        }
                        // console.log("panelData", panelData);
                        let SubmitMixPanelData = await SubmitMixPanelDetails(panelData);

                        let liferayData = {
                            assessmentDuration: timeSpent, //In seconds
                            assessmentTypeId: testType,
                            attempt: 0,
                            board: "CBSE",
                            grade: classBoardId.id,
                            subjectId: subjectClassId.id,
                            lessonId: lessonSubjectId.id,
                            topicId: 0,
                            timestamp: new Date().getTime(),
                            score: data.score,
                            headerVal: liferayHeader           
                        };
                        // console.log("liferayData",liferayData);
                        let SubmitLiferayData = await SubmitLiferayDetails(liferayData);
                    }

                    let quizSetData = {
                        set_name: set_name,
                        quiz_syllabus_path: quiz_syllabus_path,
                        num_ques: num_ques,
                        duration: duration,
                        set_type: set_type,
                        status: status,
                        created_on: createdOn,
                        created_by: created_by,
                        modified_by: modified_by,
                        quiz_type: quiz_type
                    };
                    if (set_id == undefined) {
                        Quizset.create(quizSetData, async function (err, result) {
                            if (err) {
                                console.log(err);
                                msg = { status: false, message: "Error! Please try again." };
                                return cb(null, msg);
                            }
                            let quizSybCreate = await quizSyllabusCreate(result.id, topic_id, section_id);
                            let quizQCreate = await quizQuesCreate(result.id, questions)
                            let quizSetSchools = await quizSetSchoolsCreate(school_id, result.id);
                            
                            // quizSetSchools.
                            msg = { status: true, message: "Quiz set added successfully.", data: result };
                            return cb(null, msg);
                        });
                    } else {
                        Quizset.upsertWithWhere({ id: set_id }, quizSetData, async function (err, result) {
                            if (err) {
                                console.log(err);
                                msg = { status: false, message: "Error! Please try again." };
                                return cb(null, msg);
                            }
                            let quizSybCreate = await quizSyllabusCreate(result.id, topic_id, section_id);
                            let quizQCreate = await quizQuesCreate(result.id, questions);
                            let quizSetSchools = await quizSetSchoolsCreate(school_id, result.id);
                            msg = { status: true, message: "Quiz set updated successfully.", data: result };
                            return cb(null, msg);
                        });
                    }
                } catch (error) {
                    // throw error;
                    console.log(error)
                    return cb(null, error);
                }
            } else {
                msg = { status: false, message: "Quiz set already exists." };
                return cb(null, msg);
            }
        });
    }

    Quizset.remoteMethod(
        'createQuizSet',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Quiz Set',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let quizSetSchoolsCreate = (school_id, quiz_set_id) => {
        return new Promise((resolve, reject) => {
            let quizSetSchool = Quizset.app.models.post_quiz_set_schools;
            let obj = {
                quiz_set_id: quiz_set_id,
                school_id: school_id,
                publishDate: Date.now(),
                status: 1
            }
            quizSetSchool.upsertWithWhere({ quiz_set_id: quiz_set_id, school_id: school_id }, obj,
                function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
        });
    }


    let quizSyllabusCreate = (quiz_set_id, topic_ids, section_ids) => {
        return new Promise((resolve, reject) => {
            let quizSyllabus = Quizset.app.models.post_quiz_syllabus_details;
            let topicLessonId;
            let lessonSubjectId;
            let subjectClassId;
            let classBoardId;
            let quizSbCreate;
            quizSyllabus.destroyAll({ quiz_set_id: quiz_set_id }, function (err, delResult) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                let topicIndex = topic_ids.indexOf(0);
                if (topicIndex > -1) {
                    topic_ids.splice(topicIndex, 1);
                }
                let syllabusArr = [];
                let Topics = Quizset.app.models.topics;
                let Lesson = Quizset.app.models.lessons;
                let Subject = Quizset.app.models.subjects;
                let Class = Quizset.app.models.classes;
                section_ids.forEach(async (section_id) => {

                    topic_ids.forEach(async (topicVal) => {

                        Topics.findOne(
                            {
                                where: {
                                    id: topicVal
                                }
                            }, function (err, topicResult) {
                                if (err) {

                                    //return cb(null, err);
                                    reject(err);
                                }

                                Lesson.findOne(
                                    {
                                        where: {
                                            id: topicResult.lesson_id
                                        }
                                    }, function (err, lessonResult) {
                                        if (err) {
                                            //return cb(null, err);
                                            reject(err);
                                        }

                                        Subject.findOne(
                                            {
                                                where: {
                                                    id: lessonResult.subject_id
                                                }
                                            }, function (err, subjectResult) {
                                                if (err) {
                                                    //return cb(null, err);
                                                    reject(err);
                                                }

                                                Class.findOne(
                                                    {
                                                        where: {
                                                            id: subjectResult.class_id
                                                        }
                                                    }, function (err, classResult) {
                                                        if (err) {
                                                            //return cb(null, err);
                                                            reject(err);
                                                        }
                                                        let syllabusData = {
                                                            quiz_set_id: quiz_set_id,
                                                            board_id: classResult.board_id,
                                                            class_id: subjectResult.class_id,
                                                            section_id: section_id,
                                                            subject_id: lessonResult.subject_id,
                                                            lesson_id: topicResult.lesson_id,
                                                            topic_id: topicVal
                                                        };
                                                        quizSyllabus.findOrCreate({
                                                            where: {
                                                                quiz_set_id: quiz_set_id,
                                                                board_id: classResult.board_id,
                                                                class_id: subjectResult.class_id,
                                                                section_id: section_id,
                                                                subject_id: lessonResult.subject_id,
                                                                lesson_id: topicResult.lesson_id,
                                                                topic_id: topicVal
                                                            }
                                                        }, syllabusData, function (err, sybResult) {
                                                            if (err) {
                                                                console.log(err);
                                                                reject(err);
                                                            }
                                                            resolve(sybResult);
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                        // topicLessonId = await getTopicDetails(topicVal);                   
                        // lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        // subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        // classBoardId = await getClassDetails(subjectClassId.class_id);
                        // quizSbCreate = await quizSylbCreate({board_id: classBoardId.board_id, class_id: subjectClassId.class_id, section_id: section_id, subject_id: lessonSubjectId.subject_id, lesson_id: topicLessonId.lesson_id, topicVal: topicVal});

                    });
                });
                // topic_ids.forEach( async (topicVal)=>  {
                //     topicLessonId = await getTopicDetails(topicVal);
                //     console.log(topicVal);
                //     console.log(topicLessonId.lesson_id);
                //     lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                //     subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                //     classBoardId = await getClassDetails(subjectClassId.class_id);
                //     let syllabusData = {quiz_set_id: quiz_set_id, board_id: classBoardId.board_id, class_id: subjectClassId.class_id, section_id: section_id, subject_id: lessonSubjectId.subject_id, lesson_id: topicLessonId.lesson_id, topic_id: topicVal};
                //     console.log(syllabusData);
                //     quizSyllabus.findOrCreate({where:{quiz_set_id:quiz_set_id}}, syllabusData, function(err, sybResult) {
                //         if(err){
                //             console.log(err);
                //             reject(err);
                //         }
                //         resolve(sybResult);
                //     });
                // });
            });
        });
    }

    let quizQuesCreate = (quiz_set_id, questions) => {
        return new Promise((resolve, reject) => {
            let quizQuestion = Quizset.app.models.post_quiz_questions;
            let topicLessonId;
            let lessonSubjectId;
            let subjectClassId;
            let classBoardId;
            quizQuestion.destroyAll({ quiz_set_id: quiz_set_id }, function (err, delResult) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                questions = questions.filter((v, i, a) => a.indexOf(v) === i);
                let quesOrder = 0;
                questions.forEach((quesVal) => {
                    quesOrder++;
                    let quesData = { quiz_set_id: quiz_set_id, question_id: quesVal, ques_order: quesOrder };
                    // console.log(quesData);
                    quizQuestion.findOrCreate({
                        where: {
                            quiz_set_id: quiz_set_id,
                            question_id: quesVal
                        }
                    }, quesData, function (err, quesResult) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        // console.log(quesResult);
                        resolve(quesResult);
                    });
                });
            });
        });
    }

    let getTopicDetails = (topic_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Topics = Quizset.app.models.topics;
            Topics.findOne(
                {
                    where: {
                        id: topic_id
                    }
                }, function (err, result) {
                    if (err) {
                        //return cb(null, err);
                        reject(err);
                    }
                    resolve(result);
                }
            );
        });
    }

    let getLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Lesson = Quizset.app.models.lessons;
            Lesson.findOne(
                {
                    where: {
                        id: lesson_id
                    }
                }, function (err, result) {
                    if (err) {
                        //return cb(null, err);
                        reject(err);
                    }
                    resolve(result);
                }
            );
        });
    }

    let getSubjectDetails = (subject_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Subject = Quizset.app.models.subjects;
            Subject.findOne(
                {
                    where: {
                        id: subject_id
                    }
                }, function (err, result) {
                    if (err) {
                        //return cb(null, err);
                        reject(err);
                    }
                    resolve(result);
                }
            );
        });
    }

    let getClassDetails = (class_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Class = Quizset.app.models.classes;
            Class.findOne(
                {
                    where: {
                        id: class_id
                    }
                }, function (err, result) {
                    if (err) {
                        //return cb(null, err);
                        reject(err);
                    }
                    resolve(result);
                }
            );
        });
    }

    Quizset.getAllQuizSets = async function (data, cb) {
        let msg = {};
        let set_name = (data.setName == undefined || data.setName == null || data.setName == '' ? undefined : data.setName);
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let created_by_id = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let created_by = [];
        let showAllQuiz = ['superadmin','admin'];

        // console.log("limit", limit, "offset", offset);
        if (created_by == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        try {
            created_by.push(created_by_id);
            let userType = await getUserType(created_by_id);
            let type_order = userType.toJSON().user_Type.type_order;

            if (showAllQuiz.includes(userType.toJSON().user_Type.type_name)) {
                created_by = [];
            } else {

                let assignedArr = []
                let upperAssign = await allCreatedByUpper(created_by_id, assignedArr);

                let lowerAssign = await allCreatedByLower(created_by, assignedArr);
                created_by = assignedArr;
                created_by.push(created_by_id);
                // console.log("createdby",created_by);
            }

            let getQuizSetList = await getQuizSetLists(set_name, set_id, class_id, type_order, created_by, created_by_id, limit, offset);

            return getQuizSetList;
        } catch (error) {
            throw error;
        }

    }

    Quizset.remoteMethod(
        'getAllQuizSets',
        {
            http: { path: '/getallquizsets', verb: 'post' },
            description: 'Get all active/inactive quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let getQuizSetLists = (set_name, set_id, class_id, type_order, created_by, created_by_id, limit, offset) => {
        return new Promise((resolve, reject) => {
            let cond = '';
            let joinCond = '';
            let setNameCond = '';
            let msg = {};

            let Userclasses = Quizset.app.models.user_classes;

            Userclasses.find({ where: { user_id: created_by_id } }, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                var ds = Quizset.dataSource;
                let params;
                // if (!result) {
                //     result = {};
                //     result.school_id = 0;
                //     result.class_id = 0;
                //     result.section_id = 0;
                // } else {
                    // console.log(result);
                let school_id = 0;
                let section_id = 0;
                if(result.length > 0) {
                    let schoolIdArr = [];
                    let classIdArr = [];
                    let sectionIdArr = [];
                    result.forEach((val) => {
                        // console.log(val);
                        schoolIdArr.push(val.school_id);
                        classIdArr.push(val.class_id);
                        sectionIdArr.push(val.section_id);
                    });
                    school_id = schoolIdArr.join(',');
                    class_id = classIdArr.join(',');
                    section_id = sectionIdArr.join(',');
                }

                if (set_name == undefined) {
                    setNameCond = '';
                } else {
                    set_name = '"%' + `${set_name}` + '%"'
                    setNameCond = 'and qs.set_name LIKE ' + set_name;
                }

                if (type_order == '1' || type_order == '2') {
                    cond = '';
                } else {
                    cond = ` and qss.school_id IN(${school_id}) and qsyb.class_id IN(${class_id})
                    and qsyb.section_id IN(${section_id})  and sch.status = 1 `;
                    joinCond = `LEFT JOIN schools sch on sch.id = qss.school_id
                    JOIN user_classes ud on  ud.school_id = qss.school_id `
                }
                var countSql = `SELECT qs.id
                FROM post_quiz_set qs 
                LEFT JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
                LEFT JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
                LEFT JOIN classes c on c.id = qsyb.class_id
                LEFT JOIN class_sections cs on cs.id = qsyb.section_id
                ${joinCond}
                JOIN user u on u.id = qs.created_by
                JOIN user_types ut on ut.id = u.user_type_id
                WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                and c.status = 1 and cs.status = 1
                 ${cond} ${setNameCond}
                 GROUP by qs.id`;

                var sql = `SELECT qs.id as quiz_set_id, qs.set_name, qs.created_on, qs.created_by, ut.type_order, qs.status,
                qsyb.class_id, c.class_name
                FROM post_quiz_set qs 
                LEFT JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
                LEFT JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
                LEFT JOIN classes c on c.id = qsyb.class_id
                LEFT JOIN class_sections cs on cs.id = qsyb.section_id
                ${joinCond}
                JOIN user u on u.id = qs.created_by
                JOIN user_types ut on ut.id = u.user_type_id
                WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                and c.status = 1 and cs.status = 1
                 ${cond} ${setNameCond}

                GROUP by qs.id
                ORDER BY qs.created_on DESC LIMIT ${offset},${limit};`;
                // console.log(sql);
                ds.connector.query(countSql, params, function (err, countData) {
                    if (err) {
                        console.log(err);
                        msg.status = false;
                        msg.message = "Invalid Data";
                        reject(msg)
                    }
                    // console.log(countData);
                    ds.connector.query(sql, params, function (err, quizData) {
                        if (err) {
                            console.log(err);
                            msg.status = false;
                            msg.message = "Invalid Data";
                            reject(msg)
                        }
                        let countVal = 0;
                        if (countData.length > 0) {
                            countVal = countData.length;
                        }
                        let contentData = {};
                        contentData.status = true;
                        contentData.total_count = countVal;
                        contentData.data = quizData;
                        // console.log("contentData", contentData);
                        resolve(contentData);
                    });
                });
            });
        });

    }

    let allCreatedByUpper = (created_by, assignedArr) => {
        return new Promise((resolve, reject) => {
            let user = Quizset.app.models.user;
            user.findOne({ where: { id: created_by } }, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                if (result) {
                    assignedArr.push(result.assigned_to);
                    resolve(allCreatedByUpper(result.assigned_to, assignedArr));
                }
                else {
                    resolve(assignedArr);
                }
            });
        });
    }

    let allCreatedByLower = (created_by, assignedArr) => {
        return new Promise((resolve, reject) => {
            let user = Quizset.app.models.user;
            let createdIds = [];
            user.find({ where: { assigned_to: { inq: created_by } } }, function (err, result) {
                if (err) {
                    return err;
                }
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        assignedArr.push(result[i].id);
                        createdIds.push(result[i].id);
                    }
                    resolve(allCreatedByLower(createdIds, assignedArr));
                }
                else {
                    resolve(assignedArr);
                }
            });
        });
    }

    let getUserType = (created_by) => {
        return new Promise((resolve, reject) => {
            let user = Quizset.app.models.user;
            user.findOne({
                where: { id: created_by },
                include: [
                    {
                        relation: "user_Type",
                        scope: { where: { status: 1 } }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result)
            });
        })
    }


    Quizset.getActiveQuizSets = function (data, cb) {
        let msg = {};
        let set_name = (data.setName == undefined || data.setName == null || data.setName == '' ? undefined : new RegExp(data.setName, "i"));
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);

        Quizset.find({
            where: {
                and:
                    [
                        { id: set_id },
                        { set_name: set_name },
                        { status: 1 }
                    ]
            },
            include: [
                {
                    relation: "quiz_syllabus",
                    scope: {
                        where: {
                            and: [
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
                                relation: "quiz_class",
                                scope: {
                                    fields: ["class_name"]
                                }
                            },
                            {
                                relation: "quiz_subject",
                                scope: {
                                    fields: ["subject_name"]
                                }
                            },
                            {
                                relation: "quiz_lesson",
                                scope: {
                                    fields: ["lesson_name"]
                                }
                            },
                            {
                                relation: "quiz_topic",
                                scope: {
                                    fields: ["topic_name"]
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

    Quizset.remoteMethod(
        'getActiveQuizSets',
        {
            http: { path: '/getquizsets', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizset.getActiveQuizSetDetails = function (set_id, school_id, cb) {
        let msg = {};
        //let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);

        if (set_id == undefined) {
            msg = { status: false, message: "Please provide set id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            school_id = 0;
        }

        Quizset.findOne({
            where: {
                and:
                    [
                        { id: set_id }
                    ]
            },
            include: [
                {
                    relation: "quiz_syllabus",
                    scope: {
                        where: {
                            status: 1,
                        }
                    }
                },
                {
                    relation: "quiz_questions",
                    scope: {
                        where: {
                            status: 1
                        },
                        order: 'question_id',
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
                },
                {
                    relation: "quiz_schools",
                    scope: {
                        fields: ['publishDate'],
                        where: {
                            status: 1,
                            school_id: school_id,
                            quiz_set_id: set_id
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

    Quizset.remoteMethod(
        'getActiveQuizSetDetails',
        {
            http: { path: '/getquizsetdetails', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'set_id', type: 'number', required: true },
            { arg: 'school_id', type: 'number' }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizset.getNonAcademicQuizSetSchools = function (data, cb) {
        let msg = {};

        Quizset.find({
            where: {
                and:
                    [
                        { status: 1 },
                        { set_type: 'Non-academic' }
                    ]
            },
            fields: ["id"],
            include: [
                {
                    relation: "quiz_schools",
                    scope: {
                        where: {
                            and: [
                                { status: 1 }
                            ]
                        },
                        include: [
                            {
                                relation: "quiz_set_school",
                                scope: {
                                    fields: ["id", "school_name"],
                                    where: {
                                        and: [
                                            { status: 1 }
                                        ]
                                    }
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

    Quizset.remoteMethod(
        'getNonAcademicQuizSetSchools',
        {
            http: { path: '/getschools', verb: 'post' },
            description: 'Get non academic quiz set schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizset.deleteQuiz = function (data, cb) {
        let msg = {}
        let quiz_id = (data.quiz_id == undefined || data.quiz_id == null || data.quiz_id == '' ? undefined : data.quiz_id);

        if (quiz_id == undefined) {
            msg = { status: false, message: "Please provide Quiz id" };
            return cb(null, msg);
        }

        Quizset.upsertWithWhere({ id: quiz_id }, { status: 5 }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Quizset.remoteMethod(
        'deleteQuiz',
        {
            http: { path: '/deleteQuiz', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizset.getDasboardQuizSets = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        var ds = Quizset.dataSource;
        let params;
        let cond = '';
        let joinCond = '';

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide school id.";
            return cb(null, msg);
        }

        if (class_id !== undefined) {
            cond = cond + " and qsyb.class_id = " + class_id;
        }

        if (section_id !== undefined) {
            cond = cond + " and qsyb.section_id = " + section_id;
        }

        if (student_id !== undefined) {
            joinCond = joinCond + " JOIN post_attempted_quiz_set aqs on qs.id = aqs.quiz_set_id";
            joinCond = joinCond + " JOIN quiz_user qu on aqs.user_id = qu.id ";
            joinCond = joinCond + " JOIN user_data ud on ud.email = qu.email ";
            cond = ` and ud.school_id = ${school_id} 
            and ud.class_id = ${class_id} 
            and ud.section_id = ${section_id} 
            and aqs.user_id = ${student_id}`;
        } else {
            joinCond = joinCond + " JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id";
            joinCond = joinCond + " JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id";
            cond = cond + ` and qss.school_id = ${school_id} and qss.status = 1 and qsyb.status = 1`;
        }

        var countSql = `SELECT qs.id FROM post_quiz_set qs 
        ${joinCond} WHERE qs.status = 1 ${cond}
        GROUP by qs.id`;

        var sql = `SELECT qs.id as quiz_set_id, qs.set_name, qs.status
           FROM post_quiz_set qs ${joinCond}
            WHERE qs.status = 1 ${cond}
            GROUP by qs.id
            ORDER BY qs.created_on DESC LIMIT ${offset},${limit};`;
        //console.log(sql);
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
                let countVal = 0;


                if (countData.length > 0) {
                    countVal = countData.length;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_count = countVal;
                contentData.data = quizData;
                cb(null, contentData);
            });
        });
    }

    Quizset.remoteMethod(
        'getDasboardQuizSets',
        {
            http: { path: '/getDasboardQuizSets', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Quizset.getTotalQuiz = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        
        var ds = Quizset.dataSource;
        let params;
        let cond = '';
        let studentCond = '';
        let joinCond = '';

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide school id.";
            return cb(null, msg);
        }

        if (class_id !== undefined) {
            cond = cond + " and qsyb.class_id = " + class_id;
            studentCond = studentCond + " and ud.class_id = " + class_id;
        }

        if (section_id !== undefined) {
            cond = cond + " and qsyb.section_id = " + section_id;
            studentCond = studentCond + " and ud.section_id = " + section_id;
        }

        var Totalsql = `SELECT qs.id, ud.studentName FROM post_quiz_set qs 
        JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
        JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
        JOIN user_data ud on ud.school_id = ${school_id}
        WHERE qs.status = 1 and qss.school_id = ${school_id}
        ${cond}
        GROUP by qsyb.quiz_set_id `;

        // console.log("totalSql", Totalsql)
        if (section_id === undefined) {
            var Attemptsql = `SELECT qs.id FROM post_quiz_set qs 
            JOIN post_quiz_set_schools qss on qs.id = qss.quiz_set_id
            JOIN post_quiz_syllabus_details qsyb on qs.id = qsyb.quiz_set_id
            JOIN post_attempted_quiz_set aqs on qs.id = aqs.quiz_set_id
            WHERE qs.status = 1 and qss.school_id = ${school_id}
            ${cond}
            GROUP by qs.id`;
        } else {
            var Attemptsql = `SELECT qs.id FROM  post_attempted_quiz_set aqs 
            join post_quiz_set qs on qs.id = aqs.quiz_set_id
            join quiz_user qu on qu.id = aqs.user_id
            join user_data ud on qu.email = ud.email
            join post_quiz_set_schools qss on qs.id = qss.quiz_set_id
            join post_quiz_syllabus_details qsyb on qsyb.quiz_set_id = qs.id
            WHERE qs.status = 1 and qss.school_id = ${school_id} and ud.school_id = ${school_id}
            ${cond} ${studentCond}
            GROUP by qs.id`;
        }
        //  console.log("Attemptsql", Attemptsql);

        var Studentsql = `SELECT * FROM user_data ud
        where ud.school_id = ${school_id} and user_type = 0 ${studentCond}`;

        ds.connector.query(Totalsql, params, function (err, totalQuiz) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            // console.log(totalQuiz);
            ds.connector.query(Attemptsql, params, function (err, totalQuizAttempt) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                ds.connector.query(Studentsql, params, function (err, totalStudent){
                    if (err) {
                        console.log(err);
                        msg.status = false;
                        msg.message = "Invalid Data";
                        return cb(null, msg);
                    }
                    let data = {
                        totalQuiz: totalQuiz.length,
                        totalQuizAttempt: totalQuizAttempt.length,
                        totalStudent: totalStudent.length
                    }
                    msg.status = true;
                    msg.data = data;
                    return cb(null, msg);
                })
                
            });
        });

    }

    Quizset.remoteMethod(
        'getTotalQuiz',
        {
            http: { path: '/getTotalQuiz', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Quizset.getQuizTopic = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let quiz_set_id = (data.quiz_set_id == undefined || data.quiz_set_id == null || data.quiz_set_id == '' ? undefined : data.quiz_set_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        let cond = '';
        let joinCond = '';
        var ds = Quizset.dataSource;
        let params;

        if (quiz_set_id == undefined) {
            msg.status = false;
            msg.message = "Please provide quizSet id.";
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide school id.";
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg.status = false;
            msg.message = "Please provide class id.";
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg.status = false;
            msg.message = "Please provide section id.";
            return cb(null, msg);
        }

        if(user_id != undefined){
            joinCond = `JOIN post_attempted_quiz_set aqs on aqs.quiz_set_id = qsyb.quiz_set_id`
            cond = ` and aqs.user_id = ${user_id}`;
        }

        var countSql = `SELECT qsyb.id FROM post_quiz_syllabus_details qsyb
        JOIN post_quiz_set_schools qss on qsyb.quiz_set_id = qss.quiz_set_id
        JOIN topics t on qsyb.topic_id = t.id
        ${joinCond}
        WHERE qsyb.status = 1 and qsyb.quiz_set_id = ${quiz_set_id} and qsyb.class_id = ${class_id}
        and qsyb.section_id = ${section_id} and qss.school_id = ${school_id} ${cond}
        GROUP by qsyb.id`;

        var sql = `SELECT qsyb.id, t.id as topic_id, t.topic_name FROM post_quiz_syllabus_details qsyb
        JOIN post_quiz_set_schools qss on qsyb.quiz_set_id = qss.quiz_set_id
        JOIN topics t on qsyb.topic_id = t.id
        ${joinCond}
        WHERE qsyb.status = 1 and qsyb.quiz_set_id = ${quiz_set_id} and qsyb.class_id = ${class_id}
        and qsyb.section_id = ${section_id} and qss.school_id = ${school_id} ${cond}
        GROUP by t.id
        ORDER BY qsyb.created_on DESC LIMIT ${offset},${limit}`;
        // console.log(sql);

        ds.connector.query(countSql, params, function(error, countData){
            if (error) {
                console.log(error);
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
                let countVal = 0;
                if (countData.length > 0) {
                    countVal = countData.length;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_count = countVal;
                contentData.data = quizData;
                cb(null, contentData);
            });
        });
    }

    Quizset.remoteMethod(
        'getQuizTopic',
        {
            http: { path: '/getQuizTopic' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let SubmitMixPanelDetails = (data) => {
        return new Promise((resolve, reject) => {

            let tokenData = {
                7: "9e063fae38de92135c1ac0ea98af2514",
                8: "a47f1758e5b9e5c213cc5058dfc2f772",
                9: "36b1225a59506a06578e1a18a7c094b7",
                10: "e6731abe5b9ac5b87d0a484dd6f0388d"
            }
            let token = tokenData[data.classId];
            let mixpanel = Mixpanel.init(token);
            let panelData = {
                distinct_id: data.distinct_id,
                SubjectName: data.subjectName,
                SubjectID: data.subjectId,
                LessonID: data.lessonId,
                LessonName: data.lessonName,
                LessonNumber: data.lessonNum,
                TestName: data.testName,
                TestType: data.testType,
                TestScore: data.TestScore,
                Duration: data.timeSpent * 60, //In seconds
                LongDate: new Date().getTime(),
                Date: new Date(),
                DeviceId: data.deviceId,                
            }
            mixpanel.set_config({ debug: true });
            mixpanel.track('TestCompleted', panelData);
            resolve(true);
        });
    }

    let SubmitLiferayDetails = (userData) => {
        return new Promise((resolve, reject) => {
                       
            //let url = `http://sp.marksharks.com/api/jsonws/markshark-services-portlet.msuserscore/add-entry`;            
            let url = SETTINGS.SETTINGS.liferay_userscore_entry;
            // let userData = {
            //     assessmentDuration: data.timeSpent, //In seconds
            //     assessmentTypeId: data.testType,
            //     attempt: 0,
            //     board: data.boardName,
            //     grade: data.className,
            //     subjectId: data.subjectId,
            //     lessonId: data.lessonId,
            //     topicId: data.topicId,
            //     timestamp: new Date().getTime(),
            //     score: data.score,
            //     header: data.headerVal,                
            // };
            let contentLength = userData.length;
            request.post({
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": contentLength,
                    "Authorization": "Basic " + userData.headerVal
                },
                "url": url,
                "form": userData
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    reject(err.message);
                }
                // console.log(res);
                if (JSON.parse(res.body).exception) {
                    reject(JSON.parse(res.body).exception);
                } else {
                    let response = JSON.parse(res.body);
                    if (response.userId) {
                        resolve(true);
                    } else {
                        reject("Invalid Details. Please try again.");
                    }
                }
            });
        });
    }

    let userDetails = (userId, classId='') => {
        return new Promise((resolve, reject) => {
            let userDetails = Quizset.app.models.quiz_user_details;
            userDetails.find(
                {
                    where: {
                        user_id: userId,
                        class_id: classId
                    }
                },
                function(err, userData) {
                    if(err){
                        reject(err.message);
                    }
                    resolve(userData);
                }
            )
        });
    }
};