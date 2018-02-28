'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const Hapi = require('hapi');
const ElectricFence = require('../');

const { before, describe, it } = lab;

describe('default tests', () => {

    let server;
    before(async () => {

        server = new Hapi.Server();
        await server.register({ plugin: require('inert') });
        await server.register({
            plugin: ElectricFence,
            options: { path: '../../../public' }
        });
        await server.initialize();
    });
    it('serves single file', async () => {

        const res = await server.inject({ method: 'get', url: '/humans.txt' });
        expect(res.statusCode, 'response code').to.equal(200);
        expect(res.payload, 'response body').to.equal('Humans file\n');
    });
    it('serves file from directory', async () => {

        const res = await server.inject({ method: 'get', url: '/css/test.css' });
        expect(res.statusCode, 'response code').to.equal(200);
        expect(res.payload, 'response body').to.equal('body {color: red;}\n');
    });
});

describe('no config', () => {

    it('errors expectedly since default directory is missing', async () => {

        const server = new Hapi.Server();
        await server.register({ plugin: require('inert') });
        try {
            await server.register({ plugin: ElectricFence });
        }
        catch (e) {
            var err = e;
        }
        expect(err).to.exist();
    });
});
