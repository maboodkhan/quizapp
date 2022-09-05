'use strict';

module.exports = function (Permissionroles) {

    Permissionroles.permissionAssign = async function (data, cb) {
        let permission_id = (data.permission_id == undefined || data.permission_id == null ? undefined : data.permission_id);
        let user_type_id = (data.user_type_id == undefined || data.user_type_id == null ? undefined : data.user_type_id);
        let msg = {};

        if (permission_id == undefined) {
            msg = { status: false, message: "Please provide the permission id" }
            return cb(null, msg);
        }

        if (user_type_id == undefined) {
            msg = { status: false, message: "Please provide the user_type_id" }
            return cb(null, msg);
        }

        let permissionArr = permission_id
        await underAllParentIds(permission_id, permissionArr)
        await overAllParentIds(permission_id[0], permissionArr)
        let result = await addPermissionRole(user_type_id, permissionArr);
        return result;
    }

    Permissionroles.remoteMethod(
        'permissionAssign',
        {
            http: { path: '/permissionAssign', verb: 'post' },
            description: 'Permission Assign',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let underAllParentIds = (permission_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let Permissions = Permissionroles.app.models.permissions;
            Permissions.find({ where: { parent_id: { inq: permission_id } } }, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                if (result.length > 0) {
                    let tempArr = []
                    result.forEach(element => {
                        permissionArr.push(element.id);
                        tempArr.push(element.id);
                    });
                    permission_id = tempArr;
                    resolve(underAllParentIds(permission_id, permissionArr));
                }
                else {
                    resolve(permissionArr);
                }
            });
        });
    }

    let overAllParentIds = (permission_id, upperPermissionArr) => {
        return new Promise((resolve, reject) => {
            // let permission = permission_id[0];
            let Permissions = Permissionroles.app.models.permissions;
            Permissions.findOne({ where: { id: permission_id } }, function (err, result) {
                if (err) { reject(); }
                if (result) {
                    upperPermissionArr.push(result.id)
                    permission_id = result.parent_id
                    resolve(overAllParentIds(permission_id, upperPermissionArr));
                } else {
                    resolve(upperPermissionArr);
                }
            });
        });
    }

    let addPermissionRole = (user_type_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let msg = {}
            permissionArr.forEach(permission_id => {
                let permissionObj = {
                    permission_id: permission_id,
                    user_type_id: user_type_id,
                    status: 1
                }
                // Permissionroles.upsertWithWhere({
                //     permission_id: permission_id,
                //     user_type_id: user_type_id
                // }, permissionObj, function (err, permission) {
                //     if (err) {
                //         reject(err);
                //     }
                // });
                Permissionroles.findOne({
                    where: {
                        permission_id: permission_id,
                        user_type_id: user_type_id
                    }
                }, function (err, res) {
                    if (res) {
                        Permissionroles.update(
                            { permission_id: permission_id, user_type_id: user_type_id },
                            permissionObj, function (err, res) {
                                if (err) { reject(err); }
                            })
                    } else {
                        Permissionroles.upsert(permissionObj, function (err, permission) {
                            if (err) { reject(err); }
                        });
                    }
                })
            })
            msg = { status: true, message: "Permission Added Succesfully" }
            resolve(msg);
        });
    }

    Permissionroles.permissionRemove = async function (data, cb) {
        let permission_id = (data.permission_id == undefined || data.permission_id == null ? undefined : data.permission_id);
        let user_type_id = (data.user_type_id == undefined || data.user_type_id == null ? undefined : data.user_type_id);
        let msg = {};

        if (permission_id == undefined) {
            msg = { status: false, message: "Please provide the permission id" }
            return cb(null, msg);
        }

        if (user_type_id == undefined) {
            msg = { status: false, message: "Please provide the user_type_id" }
            return cb(null, msg);
        }

        let permissionArr = permission_id
        await underAllParentIds(permission_id, permissionArr)
        let result = await removePermissionRole(user_type_id, permissionArr);
        return result;
    }

    Permissionroles.remoteMethod(
        'permissionRemove',
        {
            http: { path: '/permissionRemove', verb: 'post' },
            description: 'Permission Remove',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let removePermissionRole = (user_type_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let msg = {}
            permissionArr.forEach(permission_id => {
                // let obj = {
                //     permission_id: permission_id,
                //     user_type_id: user_type_id,
                //     status: 2
                // }
                Permissionroles.update({
                    permission_id: permission_id,
                    user_type_id: user_type_id
                }, { status: 2 },
                    function (err, res) {
                        if (err) { reject(err); }
                        msg = { status: true, data: res }
                        resolve(msg);
                    })
            })
        });
    }
};
