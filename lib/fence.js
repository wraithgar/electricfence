var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');
var defaults = {
    path: 'public',
    url: '/',
    listing: false,
    index: false
};

exports.register = function electricfence(plugin, config, next) {
    var localPath;
    config = config || {};
    config.log = plugin.log;
    _.defaults(config, defaults);
    localPath = path.join(path.dirname(require.main.filename), config.path);

    fs.readdir(localPath, function statFiles(err, files) {
        if (err) return next(err);
        async.each(files, function statFile(file, statDone) {
            fs.stat(path.join(localPath, file), function addHandler(err, stats) {
                if (err) return statDone(err);
                if (stats.isFile()) {
                    plugin.route({
                        method: 'get',
                        path: config.url + file,
                        config: {
                            handler: {file: {path: path.join(localPath, file)} }
                        }
                    });
                } else if (stats.isDirectory()) {
                    plugin.route({
                        method: 'get',
                        path: config.url + file + '/{path*}',
                        config: {
                            handler: {directory: {path: path.join(localPath, file), listing: config.listing, index: config.index} }
                        }
                    });
                }
                statDone();
            });
        }, next);
    });
};
