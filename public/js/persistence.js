/** a hash like object that is backed by a local storage json string **/
LocalStorageHash = function(key){
	this.key = key

	// create a hash to read
	this.to_hash = function(){
		return JSON.parse(localStorage[key] || '{}');
	}

	// set the full value of this hash
	this.set_hash = function(hash){
		localStorage[key] = JSON.stringify(hash);
	}

	// get the a value out at an index of this hash
	this.get_value = function(index){
		return this.to_hash()[index];
	}

	// set a value in this hash.
	// the steps are 1. parse the localStorage string, 2. edit the hash, 3. resave the string
	this.set_value = function(index, value){
		hash = this.to_hash();
		hash[index] = value;
		this.set_hash(hash);
	}

	this.remove_value = function(index){
		hash = this.to_hash();
		delete hash[index];
		this.set_hash(hash);
	}
}


/** a table like structure that is backed by local storage **/
/** we keep in index array with the ids. Then each entry is stored as a seperate localStorage key **/

LSTable = function(key, id_property){
	this._key = key;
	this._id_property = id_property;
	this._index_key = key + '.index';
	this._last_id_key = key + '.last_id';
	
	this._id_key = function(id){
		return this._key + '.' + id;
	}

	// get index array of ids
	this._get_index = function(){
		return JSON.parse(localStorage[this._index_key] || '[]');
	}

	// set index array of ids
	this._set_index = function(array){
		localStorage[this._index_key] = JSON.stringify(array);	
	}

	// remove a specific id from the index
	this._remove_id_from_index = function(id){
		var index = this._get_index();
		i = index.indexOf(id);
		if(i > -1){
			index.splice(i, 1);
		}
		this._set_index(index);
	}

	/*
	this._max_id = function(){
		var max = 0;
		index = this._get_index();
		for(var i = 0; i < index.length; i++){
			id = index[i];
			if(parseInt(id) > max) max = parseInt(id);
		}
		return max + 1;
	}; */

	this._next_id = function(){
		next_id = parseInt(localStorage[this._last_id_key] || 0) + 1;
		localStorage[this._last_id_key] = next_id;
		return next_id;
	}

	/** public functions **/

	// get an row out by id
	this.for_id = function(id){
		var str = localStorage[this._id_key(id)] || 'null';
		return JSON.parse(str);
	}

	// remove a row
	this.remove = function(id){
		localStorage.removeItem(this._id_key(id));
		this._remove_id_from_index(id);
	}

	// retrieve an array
	this.all = function(){
		var index = this._get_index();
		all = [];
		for(var i = 0; i < index.length; i++){
			all[i] = this.for_id(index[i]);
		}
		return all;
	}

	// save an object into table. if it has id then replace, otherwise generate
	this.save = function(obj){
		var id = obj[id_property];
		// if this is a new object...
		if(id == null) {
			// get out next id
			id = this._next_id();
			// set the new id
			obj[id_property] = id;
			// add id on to end of index
			index = this._get_index();
			index.push(id);
			this._set_index(index);
		}
		localStorage[this._id_key(id)] = JSON.stringify(obj);
		return id;
	}

	this.remove_all = function(){
		var index = this._get_index();

		for(var i = 0; i < index.length; i++){
			this.remove(index[i]);
		}
	}

}