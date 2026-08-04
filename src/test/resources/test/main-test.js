var t = require('/lib/xp/testing');

var calls = {
    contextRun: 0,
    repoList: 0,
    repoCreate: 0,
    createdRepoId: null,
    nodeConnect: 0,
    nodeExists: 0,
    existsPath: null,
    nodeCreate: 0,
    createdNodeName: null
};

t.mock('/lib/fotoware/xp/constants.js', {
    REPO_ID: 'com.enonic.app.fotoware',
    REPO_BRANCH: 'master',
    PERMISSIONS: [],
    CHILD_ORDER: '_ts DESC',
    TASKS_FOLDER_PARENT_PATH: '/',
    TASKS_FOLDER_NAME: 'tasks',
    TASKS_FOLDER_PATH: '/tasks'
});

t.mock('/lib/xp/context.js', {
    run: function (params, callback) {
        calls.contextRun++;
        return callback();
    }
});

t.mock('/lib/xp/repo.js', {
    list: function () {
        calls.repoList++;
        return [];
    },
    create: function (params) {
        calls.repoCreate++;
        calls.createdRepoId = params.id;
        return {
            id: params.id
        };
    }
});

t.mock('/lib/xp/node.js', {
    connect: function () {
        calls.nodeConnect++;
        return {
            exists: function (path) {
                calls.nodeExists++;
                calls.existsPath = path;
                return false;
            },
            create: function (node) {
                calls.nodeCreate++;
                calls.createdNodeName = node._name;
                return node;
            }
        };
    }
});

require('/main.js');

exports.testInitCreatesRepoAndTasksFolderSynchronously = function () {
    t.assertEquals(1, calls.contextRun, 'runInContext should be called once');
    t.assertEquals(1, calls.repoList, 'repo.list should be called once');
    t.assertEquals(1, calls.repoCreate, 'repo.create should be called once when repo is missing');
    t.assertEquals('com.enonic.app.fotoware', calls.createdRepoId, 'created repo id');
    t.assertEquals(1, calls.nodeConnect, 'node.connect should be called once');
    t.assertEquals(1, calls.nodeExists, 'connection.exists should be called once');
    t.assertEquals('/tasks', calls.existsPath, 'exists should check the tasks folder path');
    t.assertEquals(1, calls.nodeCreate, 'tasks folder should be created when missing');
    t.assertEquals('tasks', calls.createdNodeName, 'created tasks folder name');
};
