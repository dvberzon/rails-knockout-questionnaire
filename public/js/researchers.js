SALT_LENGTH = 4;
NUM_ITERATIONS = 10;
/** researcher model **/
RESEARCHERS_STORAGE_KEY = 'rkq-researchers-v3_';
RESEARCHER_LOGIN_STORAGE_KEY = 'rkq-researchers-logins-v3_'
// a researcher login
var ResearcherModel = function(researcher_def){
	this.id = researcher_def.id;
	this.username = researcher_def.username;
	this.password_encrypted = researcher_def.password;

	this.last_login = function(){
		return ResearcherModel.login_ls_hash().get_value(this.id)
	}

	this.logged_in = function(){
		ResearcherModel.login_ls_hash().set_value(this.id, new Date().getTime());
	}

	this.check_password = function(plain_text){
		return ResearcherModel.check_encrypted(plain_text, this.password_encrypted);
	}
}

ResearcherModel.check_encrypted =  function(plain_text, encrypted){
	salt = encrypted.substring(0 , SALT_LENGTH);
	hash = salt+plain_text;
	for(var i = 0; i < NUM_ITERATIONS; i++){
		hash = Sha1.hash(hash);
	}
	return (salt + hash) == encrypted;
}

ResearcherModel.set_local_storage_values = function(data){
	localStorage[RESEARCHERS_STORAGE_KEY] = JSON.stringify(data);
}

ResearcherModel.loadFromLocalJson = function(){
	json = JSON.parse(localStorage[RESEARCHERS_STORAGE_KEY]);
	ResearcherModel.researchers = {};
	ResearcherModel.by_id = {};
	for(var i = 0; i < json.length; i++){
			var researcher = new ResearcherModel(json[i]);
			ResearcherModel.researchers[researcher.username] = researcher;
			ResearcherModel.by_id[researcher.id] = researcher;
	}
}

ResearcherModel.login = function(username, password){
	researcher = ResearcherModel.researchers[username];
	if(researcher && researcher.check_password(password)){
		return researcher;
	}
	return null;
}

ResearcherModel.login_ls_hash = function(){
	return new LocalStorageHash(RESEARCHER_LOGIN_STORAGE_KEY);
}

// model for the researcher selector list. used when logging in
ResearcherList = function(){
	this.full_list = [];
	this.short_list = [];
	this.has_more = false;
	this.show_more = ko.observable(false);
	this.selected_researcher = ko.observable(null);

	// model for one of the buttons
	this.button = function(researcher, list){
		this.researcher = researcher;
		this.selected = ko.observable(false);
		this.text = this.researcher.username;

		// click function, select this researcher
		this.click = function(){
			list.reset_all();
			this.selected(true);
			list.selected_researcher(this.researcher);
		}

		this.reset = function(){
			this.selected(false);
		}
	}


	// construct the list
	for(elem in ResearcherModel.researchers){
		this.full_list.push(new this.button(ResearcherModel.researchers[elem], this));
	}
	
	// todo sort by last login date
	this.full_list.sort(function(a, b){
		date1 = a.researcher.last_login() || 0;
		date2 = b.researcher.last_login() || 0;
		return date2 - date1;
	})

	if(this.full_list.length > 5){
		this.short_list = this.full_list.slice(0,5);
		this.has_more = true;
	} else {
		this.short_list = this.full_list;
	}

	this.list = ko.computed(function(){
		if(this.show_more()){
			return this.full_list;
		}else{
			return this.short_list;
		}
	}, this);

	this.more_button_visible = ko.computed(function(){
		return(this.has_more && !this.show_more());
	}, this);

	this.more_button_click = function(){
		this.show_more(true);
	}


	this.reset_all = function(){
		this.selected_researcher(null);
		for(var i = 0; i < this.full_list.length; i++){
			this.full_list[i].reset();
		}
	}
}