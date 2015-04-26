module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        htmlhint: {
		    build: {
		        options: {
		            'tagname-lowercase': true,
		            'attr-lowercase': true,
		            'attr-value-double-quotes': true,
		            'doctype-first': true,
		            'spec-char-escape': true,
		            'id-unique': true
		        },
		        src: ['src/index.html']
		    }
		},

		//inline css and js within html files
		inline: {
			dist: {
				options: {
					cssmin: true,
					uglify: true
				},
				files: {
					'dist/index.html': 'src/index.html',
				}
			}
	    },
  		// Run automated tasks when files are updated
  		watch: {
		    html: {
		        files: ['src/index.html', 'src/js/app.js'],
		        tasks: ['htmlhint', 'inline']
		    }
		}
    });

	// Default task.
  	grunt.registerTask('default', ['htmlhint', 'inline', 'watch']);
};