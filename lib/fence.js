'use strict';

const Fs = require('fs');
const Path = require('path');
const { promisify } = require('util');

const fs_stat = promisify(Fs.stat);
const fs_readdir = promisify(Fs.readdir);
const internals = {};

internals.defaults = {
    path: 'public',
    url: '/',
    listing: true,
    index: false,
    cache: 3600000
};

const register = async (server, options) => {

    const settings = { ...internals.defaults, ...options };

    settings.local_path = Path.join(Path.dirname(require.main.filename), settings.path);

    const files = await fs_readdir(settings.local_path);
    for (const file of files) {
        const stats = await fs_stat(Path.join(settings.local_path, file));
        if (stats.isFile()) {
            server.route({
                method: 'GET',
                path: `${settings.url}${file}`,
                config: {
                    handler: {
                        file: {
                            path: Path.join(settings.local_path, file)
                        }
                    },
                    cache: { expiresIn: settings.cache }
                }
            });
        }
        //Coverage off because we are only using a file and a directory in tests, no symlinks etc
        //$lab:coverage:off$
        else if (stats.isDirectory()) {
            //$lab:coverage:on$
            server.route([{
                method: 'GET',
                path: `${settings.url}${file}/{path*}`,
                handler: {
                    directory: {
                        path: Path.join(settings.local_path, file),
                        listing: settings.listing,
                        index: settings.index
                    }
                },
                config: {
                    cache: { expiresIn: settings.cache }
                }
            }]);
        }
    }
};

module.exports = {
    register,
    name: 'electricfence',
    dependencies: ['inert']
};
