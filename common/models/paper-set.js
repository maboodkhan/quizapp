'use strict';

module.exports = function (Paperset) {
    Paperset.createQuizSet = function (data, cb) {
        let msg;
        let set_id = (data.id == undefined || data.id == null || data.id == '' ? undefined : data.id);
        let set_name = (data.set_name == undefined || data.set_name == null || data.set_name == '' ? undefined : data.set_name.trim());
        let num_ques = (data.num_ques == undefined || data.num_ques == null || data.num_ques == '' ? undefined : data.num_ques);
        let duration = (data.duration == undefined || data.duration == null || data.duration == '' ? undefined : data.duration);
        let set_type = (data.set_type == undefined || data.set_type == null || data.set_type == '' ? undefined : data.set_type);
        let multiple_attempts = (data.multiple_attempts == undefined || data.multiple_attempts == null ? undefined : data.multiple_attempts);
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
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '' ? undefined : data.country_lesson_id);
        let answerArray = (data.answerArray == undefined || data.answerArray == null || data.answerArray == '' || data.answerArray.length < 1 ? undefined : data.answerArray);
        let createdOn = new Date();
        data.created_on = createdOn;
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

        // if (questions == undefined) {
        //     msg = { status: false, message: "Please provide questions" };
        //     return cb(null, msg);
        // }

        answerArray = answerArray.filter((v, i, a) => a.indexOf(v) === i);
        if (answerArray.length > num_ques) {
            msg = { status: false, message: "You've selected more than " + num_ques + " questions. Please select only " + num_ques + " questions." };
            return cb(null, msg);
        }

        // if (answerArray.length < num_ques) {
        //     msg = { status: false, message: "Please select " + num_ques + " questions." };
        //     return cb(null, msg);
        // }

        let cond = {};
        if (set_id !== undefined) {
            cond = { id: { neq: set_id }, set_name: set_name };
        } else {
            cond = { set_name: set_name };
        }

        Paperset.count(cond, async function (err, countData) {
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
                    let boardName;
                    let countrylessonId
                    if(country_id==2) {
                        boardName = 'Indonesia Board';
                    } else {
                        boardName = 'CBSE';
                    }
                    topic_id = topic_id.filter((v, i, a) => a.indexOf(v) === i && v>0);
                    lesson_id = lesson_id.filter((v, i, a) => a.indexOf(v) === i && v>0);
                    subject_id = subject_id.filter((v, i, a) => a.indexOf(v) === i && v>0);
                    class_id = class_id.filter((v, i, a) => a.indexOf(v) === i && v>0);
                    section_id = section_id.filter((v, i, a) => a.indexOf(v) === i && v>0);

                    if(country_lesson_id != undefined){
                        country_lesson_id = country_lesson_id.filter((v, i, a) => a.indexOf(v) === i && v>0);
                    }

                    if (class_id.length > 1) {
                        quiz_syllabus_path = boardName+" >> Multiple Classes";
                    } else if (subject_id.length > 1) {
                        subjectClassId = await getSubjectDetails(subject_id[0]);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> Multiple Subjects";
                    } /*else if (country_lesson_id.length > 1 && country_lesson_id!=undefined) {
                        console.log("country",country_lesson_id);
                        lessonSubjectId = await getCountryLessonDetails(country_lesson_id[0]);                                                    
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);                       
                       
                        quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> Multiple Lessons";
                        
                    }*/ else if (lesson_id.length > 1) {
                        if(country_lesson_id === undefined || country_lesson_id[0]=="0") {
                            lessonSubjectId = await getLessonDetails(lesson_id[0]);
                        } else {
                            lessonSubjectId = await getCountryLessonDetails(country_lesson_id[0]);
                        }
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);

                        if(country_lesson_id == undefined) {
                            quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> Multiple Lessons";
                        } else {
                            if(country_lesson_id.length>1){
                                quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> Multiple Lessons";
                            } else {
                                quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.country_lesson_name + " >> Multiple Sub Lessons";
                            }
                        }
                    } else if (topic_id.length > 1) {
                        topicLessonId = await getTopicDetails(topic_id[0]);
                        if(country_lesson_id == undefined) {
                            lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        } else {                            
                            countrylessonId = await getMappedCountryLessonDetails(topicLessonId.lesson_id);
                            lessonSubjectId = await getCountryLessonDetails(countrylessonId.country_lesson_id);
                        }                            
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        
                        if(country_lesson_id == undefined) {
                            quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.lesson_name + " >> Multiple Topics";
                        } else {
                            quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.country_lesson_name + " >> " + countrylessonId.toJSON().country_lessons.lesson_name + " >> Multiple Topics";
                        }
                    } else {
                        topicLessonId = await getTopicDetails(topic_id[0]);
                        if(country_lesson_id == undefined) {
                            lessonSubjectId = await getLessonDetails(topicLessonId.lesson_id);
                        } else {
                            countrylessonId  = await getMappedCountryLessonDetails(topicLessonId.lesson_id);
                            lessonSubjectId = await getCountryLessonDetails(countrylessonId.country_lesson_id);
                        }
                        subjectClassId = await getSubjectDetails(lessonSubjectId.subject_id);
                        classBoardId = await getClassDetails(subjectClassId.class_id);
                        if(country_lesson_id == undefined) {
                            quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.lesson_name + " >> " + topicLessonId.topic_name;
                        } else {
                            quiz_syllabus_path = boardName+" >> " + classBoardId.class_name + " >> " + subjectClassId.subject_name + " >> " + lessonSubjectId.country_lesson_name + " >> " + countrylessonId.toJSON().country_lessons.lesson_name + " >> " + topicLessonId.topic_name;
                        }
                    }                
                    

                    let quizSetData = {
                        set_name: set_name,
                        quiz_syllabus_path: quiz_syllabus_path,
                        num_ques: num_ques,
                        duration: duration,
                        set_type: set_type,
                        multiple_attempts: multiple_attempts,
                        status: status,
                        created_on: createdOn,
                        created_by: created_by,
                        modified_by: modified_by
                    };
                    if (set_id == undefined) {
                        Paperset.create(quizSetData, async function (err, result) {
                            if (err) {
                                console.log(err);
                                msg = { status: false, message: "Error! Please try again." };
                                return cb(null, msg);
                            }
                            let quizSybCreate;
                            if(country_lesson_id == undefined){
                                quizSybCreate = await quizSyllabusCreate(result.id, topic_id, section_id, country_id);
                            } else {
                                quizSybCreate = await quizSyllabusCountryCreate(result.id, topic_id, section_id, country_id, country_lesson_id);
                            }
                            
                            let quizQCreate = await quizQuesCreate(result.id, questions)
                            let quizSetSchools = await quizSetSchoolsCreate(school_id, result.id);
                            // quizSetSchools.
                            msg = { status: true, message: "Quiz set added successfully." };
                            return cb(null, msg);
                        });
                    } else {
                        Paperset.upsertWithWhere({ id: set_id }, quizSetData, async function (err, result) {
                            if (err) {
                                console.log(err);
                                msg = { status: false, message: "Error! Please try again." };
                                return cb(null, msg);
                            }
                            // let quizSybCreate = await quizSyllabusCreate(result.id, topic_id, section_id);
                            let quizSybCreate;
                            if(country_lesson_id == undefined){
                                quizSybCreate = await quizSyllabusCreate(result.id, topic_id, section_id, country_id);
                            } else {
                                quizSybCreate = await quizSyllabusCountryCreate(result.id, topic_id, section_id, country_id, country_lesson_id);
                            }
                            let quizQCreate = await quizQuesCreate(result.id, questions);
                            let quizSetSchools = await quizSetSchoolsCreate(school_id, result.id);
                            msg = { status: true, message: "Quiz set updated successfully." };
                            return cb(null, msg);
                        });
                    }
                } catch (error) {
                    // throw error;
                    console.log(error);
                    return cb(null, error);
                }
            } else {
                msg = { status: false, message: "Quiz set already exists." };
                return cb(null, msg);
            }
        });
    }

    Paperset.remoteMethod(
        'createQuizSet',
        {
            http: { path: '/create', verb: 'post' },
            description: 'Create Quiz Set',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let quizSetSchoolsCreate = (school_id, paper_set_id) => {
        return new Promise((resolve, reject) => {
            let quizSetSchool = Paperset.app.models.paper_set_schools;
            quizSetSchool.update({paper_set_id: paper_set_id},{status:2},
                function(err, res){
                    if (err) {
                        reject(err);
                    }
                    school_id.forEach(schoolId => {
                        let obj = {
                            paper_set_id: paper_set_id,
                            school_id: schoolId,
                            publishDate: Date.now(),
                            status: 1
                        }
                        quizSetSchool.upsertWithWhere({ paper_set_id: paper_set_id, school_id: schoolId }, obj,
                            function (err, result) {
                                if (err) {
                                    reject(err);
                                }
                            });
                    })
                    resolve();
                })
            
        });
    }


    let quizSyllabusCreate = (paper_set_id, topic_ids, section_ids, country_id) => {
        return new Promise((resolve, reject) => {
            let quizSyllabus = Paperset.app.models.paper_syllabus_details;
            let topicLessonId;
            let lessonSubjectId;
            let subjectClassId;
            let classBoardId;
            let quizSbCreate;
            quizSyllabus.destroyAll({ paper_set_id: paper_set_id }, function (err, delResult) {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                let topicIndex = topic_ids.indexOf(0);
                if (topicIndex > -1) {
                    topic_ids.splice(topicIndex, 1);
                }
                let syllabusArr = [];
                let Topics = Paperset.app.models.topics;
                let Lesson = Paperset.app.models.lessons;
                let Subject = Paperset.app.models.subjects;
                let Class = Paperset.app.models.classes;

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
                                                            paper_set_id: paper_set_id,
                                                            board_id: classResult.board_id,
                                                            class_id: subjectResult.class_id,
                                                            section_id: section_id,
                                                            subject_id: lessonResult.subject_id,
                                                            lesson_id: topicResult.lesson_id,
                                                            topic_id: topicVal,
                                                            country_id: country_id
                                                        };
                                                        quizSyllabus.findOrCreate({
                                                            where: {
                                                                paper_set_id: paper_set_id,
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
                    });
                });
            });
        });
    }

    let quizSyllabusCountryCreate = (paper_set_id, topic_ids, section_ids, country_id, country_lesson_id) => {
        return new Promise((resolve, reject) => {
            let quizSyllabus = Paperset.app.models.paper_syllabus_details;
            let topicLessonId;
            let lessonSubjectId;
            let subjectClassId;
            let classBoardId;
            let quizSbCreate;
            quizSyllabus.destroyAll({ paper_set_id: paper_set_id }, function (err, delResult) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                let topicIndex = topic_ids.indexOf(0);
                if (topicIndex > -1) {
                    topic_ids.splice(topicIndex, 1);
                }
                let syllabusArr = [];
                let Topics = Paperset.app.models.topics;
                let Lesson = Paperset.app.models.lessons;
                let Subject = Paperset.app.models.subjects;
                let Class = Paperset.app.models.classes;
                let LessonMapping = Paperset.app.models.country_lesson_mapping;
                let countryLessons = Paperset.app.models.country_lessons;
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
                                        country_lesson_id.forEach((clValId) => {
                                            LessonMapping.findOne(
                                                {
                                                    where: {
                                                        country_lesson_id: clValId
                                                        // lesson_id: topicResult.lesson_id,
                                                    }
                                                }, function (err, lessonMapResult) {
                                                    if (err) {
                                                        //return cb(null, err);
                                                        reject(err);
                                                    }
                                                    if(lessonMapResult){
                                                        countryLessons.findOne(
                                                            {
                                                                where: {
                                                                    id: lessonMapResult.country_lesson_id
                                                                }
                                                            }, function (err, countryLessonResult) {
                                                                if (err) {
                                                                    //return cb(null, err);
                                                                    reject(err);
                                                                }
        
                                                                Subject.findOne(
                                                                    {
                                                                        where: {
                                                                            id: countryLessonResult.subject_id
                                                                        }
                                                                    }, function (err, subjectResult) {
                                                                        if (err) {
                                                                            //return cb(null, err);
                                                                            reject(err);
                                                                        }
        
                                                                        Class.findOne(
                                                                            {
                                                                                where: {
                                                                                    id: countryLessonResult.class_id
                                                                                }
                                                                            }, function (err, classResult) {
                                                                                if (err) {
                                                                                    //return cb(null, err);
                                                                                    reject(err);
                                                                                }
                                                                                let syllabusData = {
                                                                                    paper_set_id: paper_set_id,
                                                                                    board_id: classResult.board_id,
                                                                                    class_id: countryLessonResult.class_id,
                                                                                    section_id: section_id,
                                                                                    subject_id: countryLessonResult.subject_id,
                                                                                    lesson_id: lessonMapResult.lesson_id,
                                                                                    topic_id: topicVal,
                                                                                    country_id: country_id,
                                                                                    country_lesson_id: lessonMapResult.country_lesson_id
                                                                                };
                                                                                quizSyllabus.findOrCreate({
                                                                                    where: {
                                                                                        paper_set_id: paper_set_id,
                                                                                        board_id: classResult.board_id,
                                                                                        class_id: countryLessonResult.class_id,
                                                                                        section_id: section_id,
                                                                                        subject_id: countryLessonResult.subject_id,
                                                                                        lesson_id: lessonMapResult.lesson_id,
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
                                                }
                                            );
                                        })                                        
                                    }
                                );
                            }
                        );
                    });
                });
            });
        });
    }

    let quizQuesCreate = (paper_set_id, questions) => {
        return new Promise((resolve, reject) => {
            let quizQuestion = Paperset.app.models.paper_questions;
            let topicLessonId;
            let lessonSubjectId;
            let subjectClassId;
            let classBoardId;
            quizQuestion.destroyAll({ paper_set_id: paper_set_id }, function (err, delResult) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                questions = questions.filter((v, i, a) => a.indexOf(v) === i);
                questions.forEach((quesVal) => {
                    let quesData = { paper_set_id: paper_set_id, question_id: quesVal };
                    // console.log(quesData);
                    quizQuestion.findOrCreate({
                        where: {
                            paper_set_id: paper_set_id,
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
            let Topics = Paperset.app.models.topics;
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
            let Lesson = Paperset.app.models.lessons;
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
            let Subject = Paperset.app.models.subjects;
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
            let Class = Paperset.app.models.classes;
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

    Paperset.getAllQuizSets = async function (data, cb) {
        let msg = {};
        let set_name = (data.setName == undefined || data.setName == null || data.setName == '' ? undefined : data.setName);
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);
        let created_by_id = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let created_by = [];
        let showAllQuiz = ['superadmin','admin'];

        // console.log("limit", limit, "offset", offset);
        

        try {
            if (created_by == undefined) {
                msg = { status: false, message: "Please provide user id" };
                return msg;
            }   
            
            created_by.push(created_by_id);
            let userType = await getUserType(created_by_id);
            let type_order = userType.toJSON().user_Type.type_order;

            if (showAllQuiz.includes(userType.toJSON().user_Type.type_name)) {
                created_by = [];
            } else {
                if (school_id == undefined) {
                    msg = { status: false, message: "Please provide school id" };
                    return msg;
                }
        
                if (class_id == undefined) {
                    msg = { status: false, message: "Please provide class id" };
                    return msg;
                }
        
                if (section_id == undefined) {
                    msg = { status: false, message: "Please provide section id" };
                    return msg;
                }
                // let assignedArr = [];
                // let upperAssign = await allCreatedByUpper(created_by_id, assignedArr);

                // let lowerAssign = await allCreatedByLower(created_by, assignedArr);
                // created_by = assignedArr;
                // created_by.push(created_by_id);
                // console.log("createdby",created_by);
            }

            let getQuizSetList = await getQuizSetLists(set_name, set_id, school_id, class_id, section_id, type_order, created_by, created_by_id, limit, offset);

            return getQuizSetList;
        } catch (error) {
            console.log(error)
            msg = {status: false, message: error.message};
            return msg;
            // return error;
        }

    }

    Paperset.remoteMethod(
        'getAllQuizSets',
        {
            http: { path: '/getallquizsets', verb: 'post' },
            description: 'Get all active/inactive quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let getQuizSetLists = (set_name, set_id, school_id, class_id, section_id, type_order, created_by, created_by_id, limit, offset) => {
        return new Promise((resolve, reject) => {
            let cond = '';
            let joinCond = '';
            let setNameCond = '';
            let msg = {};

            // let Userclasses = Paperset.app.models.user_classes;

            // Userclasses.find({ where: { user_id: created_by_id } }, function (err, result) {
            //     if (err) {
            //         console.log(err);
            //         reject(err);
            //     }
                var ds = Paperset.dataSource;
                let params;
                // let school_id = 0;
                // let section_id = 0;
                // if(result.length > 0) {
                //     let schoolIdArr = [];
                //     let classIdArr = [];
                //     let sectionIdArr = [];
                //     result.forEach((val) => {
                //         schoolIdArr.push(val.school_id);
                //         classIdArr.push(val.class_id);
                //         sectionIdArr.push(val.section_id);
                //     });
                //     school_id = schoolIdArr.join(',');
                //     class_id = classIdArr.join(',');
                //     section_id = sectionIdArr.join(',');
                // }

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
                    and qsyb.section_id IN(${section_id})`;
                    // joinCond = `LEFT JOIN schools sch on sch.id = qss.school_id
                    // JOIN user_classes ud on  ud.school_id = qss.school_id `
                }
                // var countSql = `SELECT qs.id
                // FROM quiz_set qs 
                // LEFT JOIN quiz_set_schools qss on qs.id = qss.paper_set_id
                // LEFT JOIN quiz_syllabus_details qsyb on qs.id = qsyb.paper_set_id
                // LEFT JOIN classes c on c.id = qsyb.class_id
                // LEFT JOIN class_sections cs on cs.id = qsyb.section_id
                // ${joinCond}
                // JOIN user u on u.id = qs.created_by
                // JOIN user_types ut on ut.id = u.user_type_id
                // WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                // and c.status = 1 and cs.status = 1
                //  ${cond} ${setNameCond}
                //  GROUP by qs.id`;

                // var sql = `SELECT qs.id as paper_set_id, qs.set_name, qs.created_on, qs.created_by, ut.type_order, qs.status,
                // qsyb.class_id, c.class_name
                // FROM quiz_set qs 
                // LEFT JOIN quiz_set_schools qss on qs.id = qss.paper_set_id
                // LEFT JOIN quiz_syllabus_details qsyb on qs.id = qsyb.paper_set_id
                // LEFT JOIN classes c on c.id = qsyb.class_id
                // LEFT JOIN class_sections cs on cs.id = qsyb.section_id
                // ${joinCond}
                // JOIN user u on u.id = qs.created_by
                // JOIN user_types ut on ut.id = u.user_type_id
                // WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                // and c.status = 1 and cs.status = 1
                //  ${cond} ${setNameCond}

                // GROUP by qs.id
                // ORDER BY qs.created_on DESC LIMIT ${offset},${limit};`;
                var countSql = `SELECT qs.id
                FROM paper_set qs 
                LEFT JOIN paper_set_schools qss on qs.id = qss.paper_set_id
                LEFT JOIN paper_syllabus_details qsyb on qs.id = qsyb.paper_set_id
                LEFT JOIN classes c on c.id = qsyb.class_id
                WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                and c.status = 1
                 ${cond} ${setNameCond}
                 GROUP by qs.id`;

                var sql = `SELECT qs.id as paper_set_id, qs.set_name, qs.created_on, qs.created_by, qs.status,
                qsyb.class_id, c.class_name
                FROM paper_set qs 
                LEFT JOIN paper_set_schools qss on qs.id = qss.paper_set_id
                LEFT JOIN paper_syllabus_details qsyb on qs.id = qsyb.paper_set_id
                LEFT JOIN classes c on c.id = qsyb.class_id
                
                WHERE qs.status IN (1,2) and qss.status = 1 and qsyb.status = 1
                and c.status = 1
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
            // });
        });

    }

    let allCreatedByUpper = (created_by, assignedArr) => {
        return new Promise((resolve, reject) => {
            let user = Paperset.app.models.user;
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
            let user = Paperset.app.models.user;
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
            let user = Paperset.app.models.user;
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


    Paperset.getActiveQuizSets = function (data, cb) {
        let msg = {};
        let set_name = (data.setName == undefined || data.setName == null || data.setName == '' ? undefined : new RegExp(data.setName, "i"));
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '' ? undefined : data.board_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let topic_id = (data.topic_id == undefined || data.topic_id == null || data.topic_id == '' ? undefined : data.topic_id);

        Paperset.find({
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

    Paperset.remoteMethod(
        'getActiveQuizSets',
        {
            http: { path: '/getquizsets', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Paperset.getActiveQuizSetDetails = function (set_id, school_id, cb) {
        let msg = {};
        //let set_id = (data.set_id==undefined || data.set_id==null || data.set_id==''?undefined:data.set_id);

        if (set_id == undefined) {
            msg = { status: false, message: "Please provide set id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            school_id = 0;
        }

        Paperset.findOne({
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
                        // fields: ['publishDate'],
                        where: {
                            status: 1,
                            // school_id: school_id,
                            paper_set_id: set_id
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

    Paperset.remoteMethod(
        'getActiveQuizSetDetails',
        {
            http: { path: '/getquizsetdetails', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'set_id', type: 'number', required: true },
            { arg: 'school_id', type: 'number' }],
            returns: { root: true, type: 'json' }
        }
    );

    Paperset.getNonAcademicQuizSetSchools = function (data, cb) {
        let msg = {};

        Paperset.find({
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

    Paperset.remoteMethod(
        'getNonAcademicQuizSetSchools',
        {
            http: { path: '/getschools', verb: 'post' },
            description: 'Get non academic quiz set schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Paperset.deleteQuiz = function (data, cb) {
        let msg = {}
        let quiz_id = (data.quiz_id == undefined || data.quiz_id == null || data.quiz_id == '' ? undefined : data.quiz_id);

        if (quiz_id == undefined) {
            msg = { status: false, message: "Please provide Quiz id" };
            return cb(null, msg);
        }

        Paperset.upsertWithWhere({ id: quiz_id }, { status: 5 }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Paperset.remoteMethod(
        'deleteQuiz',
        {
            http: { path: '/deleteQuiz', verb: 'post' },
            description: 'Get active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Paperset.getDasboardQuizSets = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        var ds = Paperset.dataSource;
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
            joinCond = joinCond + " JOIN attempted_quiz_set aqs on qs.id = aqs.paper_set_id";
            joinCond = joinCond + " JOIN quiz_user qu on aqs.user_id = qu.id ";
            joinCond = joinCond + " JOIN user_data ud on ud.email = qu.email ";
            cond = ` and ud.school_id = ${school_id} 
            and ud.class_id = ${class_id} 
            and ud.section_id = ${section_id} 
            and aqs.user_id = ${student_id}`;
        } else {
            joinCond = joinCond + " JOIN quiz_set_schools qss on qs.id = qss.paper_set_id";
            joinCond = joinCond + " JOIN quiz_syllabus_details qsyb on qs.id = qsyb.paper_set_id";
            cond = cond + ` and qss.school_id = ${school_id} and qss.status = 1 and qsyb.status = 1`;
        }

        var countSql = `SELECT qs.id FROM quiz_set qs 
        ${joinCond} WHERE qs.status = 1 ${cond}
        GROUP by qs.id`;

        var sql = `SELECT qs.id as paper_set_id, qs.set_name, qs.status, qs.created_by
           FROM quiz_set qs ${joinCond}
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

    Paperset.remoteMethod(
        'getDasboardQuizSets',
        {
            http: { path: '/getDasboardQuizSets', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Paperset.getTotalQuiz = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        
        var ds = Paperset.dataSource;
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

        var Totalsql = `SELECT qs.id, ud.studentName FROM quiz_set qs 
        JOIN quiz_set_schools qss on qs.id = qss.paper_set_id
        JOIN quiz_syllabus_details qsyb on qs.id = qsyb.paper_set_id
        JOIN user_data ud on ud.school_id = ${school_id}
        WHERE qs.status = 1 and qss.school_id = ${school_id}
        ${cond}
        GROUP by qsyb.paper_set_id `;

        // console.log("totalSql", Totalsql)
        if (section_id === undefined) {
            var Attemptsql = `SELECT qs.id FROM quiz_set qs 
            JOIN quiz_set_schools qss on qs.id = qss.paper_set_id
            JOIN quiz_syllabus_details qsyb on qs.id = qsyb.paper_set_id
            JOIN attempted_quiz_set aqs on qs.id = aqs.paper_set_id
            WHERE qs.status = 1 and qss.school_id = ${school_id}
            ${cond}
            GROUP by qs.id`;
        } else {
            var Attemptsql = `SELECT qs.id FROM  attempted_quiz_set aqs 
            join quiz_set qs on qs.id = aqs.paper_set_id
            join quiz_user qu on qu.id = aqs.user_id
            join user_data ud on qu.email = ud.email
            join quiz_set_schools qss on qs.id = qss.paper_set_id
            join quiz_syllabus_details qsyb on qsyb.paper_set_id = qs.id
            WHERE qs.status = 1 and qss.school_id = ${school_id} and ud.school_id = ${school_id}
            ${cond} ${studentCond}
            GROUP by qs.id`;
        }
        //  console.log("Attemptsql", Attemptsql);

        var Studentsql = `SELECT * FROM user_data ud
        where ud.school_id = ${school_id} and user_type=0 ${studentCond}`;

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

    Paperset.remoteMethod(
        'getTotalQuiz',
        {
            http: { path: '/getTotalQuiz', verb: 'post' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Paperset.getQuizTopic = function (data, cb) {
        let msg = {};
        // console.log(data);  
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let paper_set_id = (data.paper_set_id == undefined || data.paper_set_id == null || data.paper_set_id == '' ? undefined : data.paper_set_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        let cond = '';
        let joinCond = '';
        var ds = Paperset.dataSource;
        let params;

        if (paper_set_id == undefined) {
            msg.status = false;
            msg.message = "Please provide Paperset id.";
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
            joinCond = `JOIN attempted_quiz_set aqs on aqs.paper_set_id = qsyb.paper_set_id`
            cond = ` and aqs.user_id = ${user_id}`;
        }

        var countSql = `SELECT qsyb.id FROM quiz_syllabus_details qsyb
        JOIN quiz_set_schools qss on qsyb.paper_set_id = qss.paper_set_id
        JOIN topics t on qsyb.topic_id = t.id
        ${joinCond}
        WHERE qsyb.status = 1 and qsyb.paper_set_id = ${paper_set_id} and qsyb.class_id = ${class_id}
        and qsyb.section_id = ${section_id} and qss.school_id = ${school_id} ${cond}
        GROUP by qsyb.id`;

        var sql = `SELECT qsyb.id, t.id as topic_id, t.topic_name FROM quiz_syllabus_details qsyb
        JOIN quiz_set_schools qss on qsyb.paper_set_id = qss.paper_set_id
        JOIN topics t on qsyb.topic_id = t.id
        ${joinCond}
        WHERE qsyb.status = 1 and qsyb.paper_set_id = ${paper_set_id} and qsyb.class_id = ${class_id}
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

    Paperset.remoteMethod(
        'getQuizTopic',
        {
            http: { path: '/getQuizTopic' },
            description: 'Get school active quiz sets',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getCountryLessonDetails = (country_lesson_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Lesson = Paperset.app.models.country_lessons;
            Lesson.findOne(
                {
                    where: {
                        id: country_lesson_id
                    },
                    include:[
                        {
                            relation: 'class_lessons',
                            scope:{

                            }
                        }
                    ]
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

    let getMappedCountryLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Lesson = Paperset.app.models.country_lesson_mapping;
            Lesson.findOne(
                {
                    where: {
                        lesson_id: lesson_id
                    },
                    include:[
                        {
                            relation: 'country_lessons',
                            scope:{

                            }
                        }
                    ]
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

};