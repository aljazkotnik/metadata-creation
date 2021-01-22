var fileManager = {
	
	
	// CHECK TO SEE IF THE FILE WAS ALREADY LOADED!!
	importing: {
		
		prompt: function(requestPromises){
			
			Promise.allSettled(requestPromises).then(function(files){

				let allMetadataFiles = fileManager.library.retrieve(metadataFile)

				// PROMPT THE USER
				if(allMetadataFiles.length > 0){
					// Prompt the user to handle the categorication and merging.
					
					// Make the variable handling
					dbsliceDataCreation.make()
					dbsliceDataCreation.show()
					
				} else {
					// If there is no files the user should be alerted. This should use the reporting to tell the user why not.
					alert("None of the selected files were usable.")
				} // if
				
			}) // then
			
		}, // prompt
		
		mixedbatch: function(files){
			// Metadata importing is initialised through the UI, therefore 'file' is an array of File objects.
			
			var requestPromises = files.map(function(file){
			
				// Construct the appropriate file object.
				let fileobj = new userFile(file)
				
				// Check if this file already exists loaded in.
				let libraryEntry = fileManager.library.retrieve(metadataFile, fileobj.filename)
				if(libraryEntry){
					fileobj = libraryEntry
				} else {
					// Initiate loading straight away
					fileobj.load()
				
					// Mutate the object after loading.
					fileobj.promise.then(function(obj_){
					  switch(obj_.content.format){
						case "metadataFile":
							fileManager.library.store(metadataFile, obj_)
						  break;
						case "mergerInfoFile":
							// The library stores the results, but NOT as a file!
							fileManager.library.store(mergerInfoFile, obj_)
							
						  break;
					  } // switch
					}) // then
					
				} // if
				
				return fileobj.promise
			}) // map
			
			
			// Prompt the user to handle the categorisation and merging.
			fileManager.importing.prompt(requestPromises)
			

		}, // mixedbatch
		
		
		// Abstract the specific loaders??
		mergerinfo: function(files){
			
			// mergerinfo is stored internally as an object, therefore these files are just reloaded.
			
			var requestPromises = files.map(function(file){
				
				// Construct the appropriate file object.
				let fileobj = new mergerInfoFile(file)
				
				// Initiate loading straight away
				fileobj.load()
				
				// Merge info files are NOT stored internally!!
				
				
				// The files are only stored internally after they are loaded, therefore a reference must be maintained to the file loaders here.
				return fileobj.promise
			})
			
			// Prompt the user to handle the categorisation and merging.
			fileManager.importing.prompt(requestPromises)
			
		}, // mergerinfo
			
		metadata: function(files){
			// Check if the files have been laoded already.
			
			
			var requestPromises = files.map(function(file){
				
				// Construct the appropriate file object.
				let fileobj = new metadataFile(file)
				
				// Check if this file already exists loaded in.
				let libraryEntry = fileManager.library.retrieve(metadataFile, fileobj.filename)
				if(libraryEntry){
					fileobj = libraryEntry
				} else {
					// Initiate loading straight away
					fileobj.load()
					
					// After loading if hte file has loaded correctly it has some content and can be added to internal storage.
					fileManager.library.store(metadataFile, fileobj)
				} // if
				

				// The files are only stored internally after they are loaded, therefore a reference must be maintained to the file loaders here.
				return fileobj.promise
			})
			
			
			// Prompt the user to handle the categorisation and merging.
			fileManager.importing.prompt(requestPromises)
			
		} // metadata
		
	}, // importing
	
	library: {
		
		store: function(classref, fileobj){
			
			
			if(classref == mergerInfoFile){
				// Merger info is stored just as an internal structure. It is pruned away already on loading!!
				let lmi = dbsliceDataCreation.loadedMergeInfo
				if(lmi){
					Object.assign(lmi, obj_.content)
				} else {
					lmi = obj_
				} // if
				
			} else {
				
				if(fileobj instanceof classref){
			
					fileobj.promise.then(function(obj_){
						if(obj_.content){
							dbsliceData.files.push(fileobj)
						} // if
					})
				
				} // if
				
			} // if
			
			
			
		}, // store
		
		retrieve: function(classref, filename){
			// If filename is defined, then try to return that file. Otherwise return all.
			
			let files
			if(filename){
			
				files = dbsliceData.files.filter(function(file){
					return file.filename == filename
				}) // filter
				files = files[0]
				
			} else {
				
				files = dbsliceData.files.filter(function(file){
					return file instanceof classref
				}) // filter
				
			} // if
			
			return files
			
		}, // retrieve
		
		
		remove: function(classref, filename){
			
			// First get the reference to all hte files to be removed.
			let filesForRemoval = fileManager.library.retrieve(classref, file)
			
			// For each of these find it's index, and splice it.
			filesForRemoval.forEach(function(file){
				let i = dbsliceData.files.indexOf(file)
				dbsliceData.files.splice(i,1)
			})
			
		}, // remove
		
		availability: function(classref, filename){}, //

		
	}, // library
	
} // fileManager