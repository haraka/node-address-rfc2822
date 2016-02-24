'use strict';

module.exports = function(grunt) {

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
    });

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', ['eslint']);
};
