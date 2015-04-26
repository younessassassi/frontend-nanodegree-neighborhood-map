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

		jslint: { // configure the task
	      // lint your project's client code
	      client: {
	        src: [
	          'src/js/app.js'
	        ],
	        directives: {
	          browser: true,
	          predef: [
	            'jQuery'
	          ]
	        }
	      }
	    },

        // Keep JavaScript as lean as possible
		uglify: {
		    build: {
		    	files: {
		    		'dist/js/lib/bootstrap.min.js': ['src/js/lib/bootstrap.js'],
		    		'dist/js/lib/jquery-1.11.2.min.js': ['src/js/lib/jquery-1.11.2.min.js'],
		    		'dist/js/lib/knockout-3.2.0.min.js': ['src/js/lib/knockout-3.2.0.js']
		    	}
		    }
		},
		// keep CSS as lean as possible
		cssmin: {
		  target: {
		    files: {
		      'dist/css/lib/bootstrap.min.css': ['src/css/lib/bootstrap.css'],
		      'dist/css/lib//bootstrap-theme.min.css': ['src/css/lib/bootstrap-theme.css']
		    }
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
  	grunt.registerTask('default', ['htmlhint', 'cssmin', 'uglify', 'inline', 'watch']);
};