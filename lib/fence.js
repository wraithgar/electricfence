var fs = require('fs');
var path = require('path');
var async = require('async');
var defaultConfig = {
    path: 'public',
    url: '/',
    listing: true,
    index: false,
    cache: 3600000
};

function isObject(obj) {
    var type = typeof obj;
    return !!obj && (type === 'function' || type === 'object');
}

function defaults(obj) {
    if (!isObject(obj)) { return obj; }
    for (var i = 1, length = arguments.length; i < length; i++) {
        var source = arguments[i];
        for (var prop in source) {
            if (obj[prop] === void 0) { obj[prop] = source[prop]; }
        }
    }
    return obj;
}

exports.register = function electricfence(plugin, config, next) {
    var servers, localPath;
    //Config will always exist thanks to hapi
    config.log = plugin.log;
    defaults(config, defaultConfig);
    servers = (config.labels) ? plugin.select(config.labels) : plugin;
    localPath = path.join(path.dirname(require.main.filename), config.path);

    fs.readdir(localPath, function statFiles(err, files) {
        if (err) { return next(err.stack); }
        async.each(files, function statFile(file, statDone) {
            fs.stat(path.join(localPath, file), function addHandler(err, stats) {
                if (err) { return statDone(err); }
                if (stats.isFile()) {
                    servers.route({
                        method: 'get',
                        path: config.url + file,
                        config: {
                            handler: {file: {path: path.join(localPath, file)} },
                            cache: {expiresIn: config.cache}
                        }
                    });
                } else if (stats.isDirectory()) {
                    servers.route({
                        method: 'get',
                        path: config.url + file + '/{path*}',
                        config: {
                            handler: {directory: {path: path.join(localPath, file), listing: config.listing, index: config.index} },
                            cache: {expiresIn: config.cache}
                        }
                    });
                }
                statDone();
            });
        }, next);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
