'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-eslint');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            main: {
                src: ['*.js' ]
            },
            test: {
                src: ['test/**/*.js'],
            }
        },
        nearley: {
            src: ['grammar/address_format.ne'],
            out: 'lib',
        }
    });

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', ['eslint']);
    grunt.registerTask('nearley', "Build the library from the grammar", nearley(grunt));
    grunt.registerTask('build', ['nearley']);
};

function nearley (grunt) {
    return function () {
        var cp = require('child_process');
        var done = this.async();

        var config = grunt.config(this.name);
        var done_count = 0;
        config.src.forEach(function (src) {
            var to_run = process.execPath + " ./node_modules/nearley/bin/nearleyc " + src + " -o " + src.replace(/.*\//, (config.out + "/")).replace(/\.ne$/, '.js');
            console.log("Running: " + to_run);
            cp.exec(to_run, function (err, stdout, stderr) {
                if (err) throw err;
                if (/\S/.test(stdout))
                    console.log(stdout);
                done_count++;
                if (done_count == config.src.length) {
                    done();
                }
            });
        });
    }
}

