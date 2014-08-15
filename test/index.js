var server;
var Lab = require('lab');
var Hapi = require('hapi');
var ElectricFence = require('../');
var lab = exports.lab = Lab.script();

lab.experiment('default tests', function () {
    lab.before(function(done) {
        server = new Hapi.Server(3001);
        server.pack.register([{
            plugin: ElectricFence,
            options: {path: '../../../public'}
        }], function _packRegistered(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    });
    lab.test('serves single file', function (done) {
        server.inject({
            method: 'get',
            url: '/humans.txt'
        }, function _getFile(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal('Humans file\n');
            done();
        });
    });
    lab.test('serves file from directory', function (done) {
        server.inject({
            method: 'get',
            url: '/css/test.css'
        }, function _getDirectoryFile(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal('body {color: red;}\n');
            done();
        });
    });
});


lab.experiment('no config', function () {
    lab.test('errors expectedly since default directory is missing', function(done) {
        server = new Hapi.Server(3001);
        server.pack.register([{plugin: ElectricFence}], function _packRegistered(err) {
            Lab.expect(err, 'register error').to.include('readdir');
            done();
        });
    });
});
