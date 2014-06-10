module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.initConfig({
    handlebars: {
      compile: {
        options: {
          namespace: "JST"
        },
        files: [{
          expand: true,
          src: '**/*.hbs',
          dest: 'compiled/',
          ext: ".js"
        }]
      }
    }
  });


  grunt.registerTask('default', [
    'handlebars'
  ]);

};
