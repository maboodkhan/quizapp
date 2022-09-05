'use strict';

module.exports = function (Permissionusers) {

    Permissionusers.permissionAssign = async function (data, cb) {
        let permission_id = (data.permission_id == undefined || data.permission_id == null ? undefined : data.permission_id);
        let user_id = (data.user_id == undefined || data.user_id == null ? undefined : data.user_id);
        let msg = {};

        if (permission_id == undefined) {
            msg = { status: false, message: "Please provide the permission id" }
            return cb(null, msg);
        }

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide the user_id" }
            return cb(null, msg);
        }

        let permissionArr = permission_id
        await allParentIds(permission_id, permissionArr)
        let result = await addPermissionRole(user_id, permissionArr);
        return result;
    }

    Permissionusers.remoteMethod(
        'permissionAssign',
        {
            http: { path: '/permissionAssign', verb: 'post' },
            description: 'Permission Assign',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let allParentIds = (permission_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let Permissions = Permissionusers.app.models.permissions;
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
                    resolve(allParentIds(permission_id, permissionArr));
                }
                else {
                    resolve(permissionArr);
                }
            });
        });
    }

    let addPermissionRole = (user_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let msg = {}
            permissionArr.forEach(permission_id => {
                let permissionObj = {
                    permission_id: permission_id,
                    user_id: user_id,
                    status: 1
                }
                Permissionusers.upsertWithWhere({
                    permission_id: permission_id,
                    user_id: user_id
                }, permissionObj, function (err, permission) {
                    if (err) {
                        reject(err);
                    }
                });
            })
            msg = { status: true, message: "Permission Added Succesfully" }
            resolve(msg);
        });
    }

    Permissionusers.permissionRemove = async function (data, cb) {
        let permission_id = (data.permission_id == undefined || data.permission_id == null ? undefined : data.permission_id);
        let user_id = (data.user_id == undefined || data.user_id == null ? undefined : data.user_id);
        let msg = {};

        if (permission_id == undefined) {
            msg = { status: false, message: "Please provide the permission id" }
            return cb(null, msg);
        }

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide the user_id" }
            return cb(null, msg);
        }

        let permissionArr = permission_id
        await allParentIds(permission_id, permissionArr)
        let result = await removePermissionRole(user_id, permissionArr);
        return result;
    }

    Permissionusers.remoteMethod(
        'permissionRemove',
        {
            http: { path: '/permissionRemove', verb: 'post' },
            description: 'Permission Remove',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let removePermissionRole = (user_id, permissionArr) => {
        return new Promise((resolve, reject) => {
            let msg = {}
            permissionArr.forEach(permission_id => {
                let obj = {
                    permission_id: permission_id,
                    user_id: user_id,
                    status: 2
                }
                Permissionusers.upsertWithWhere({
                    permission_id: permission_id,
                    user_id: user_id
                }, obj,
                    function (err, res) {
                        if (err) { reject(err); }
                        msg = { status: true, data: res }
                        resolve(msg);
                    })
            })
        });
    }
};
