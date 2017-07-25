PARTICIPANT_STORAGE_KEY = 'rkq-participants-v1_';
LAST_CONSENT_ID_STORAGE_KEY = 'rkq-last_consent_id-v1';
PARTICIPANT_STATUSES = {
	'added': {name: 'Added', bootstrap_colour: 'info'},
	'approached': {name: 'Approached', bootstrap_colour: 'info'},
	'not_approached': {name: 'Not approached', bootstrap_colour: 'default' },
	'not_yet_approached': {name: 'Not yet approached', bootstrap_colour: 'default' },
	'in_progress': {name: 'In progress', bootstrap_colour: 'success'},
	'not_included': {name: 'Not Included', bootstrap_colour: 'warning'},
	'not_consented': {name: 'Not Consented', bootstrap_colour: 'warning'},
	'completed': {name: 'Completed', bootstrap_colour: 'primary'},
	'terminated': {name: 'Terminated', bootstrap_colour: 'danger'}
}

Participant = function(data){
	// the following variables names should be initialised with null if not data value is provided
	field_defaults = {
		"date_added": new Date().getTime(),
		"date_modified": new Date().getTime(),
		"added_by_id": null,
		"participant_id": null, //Participant.next_id(),
		"study_id": null,
		"first_name": null,
		"age": null,
		"gender": null,
		"participant_approached": 'not-yet',
		"reason_not_approached": null,
		"reason_not_approached_other": null,
		"terminated": false,
		"reason_terminated": null,
		"termination_type": 'retain',
		"notes": null,
		"questionnaire_started": null,
		"questionnaire_step": null,
		"consented": null,
		"date_consented": null,

		"completed": null,

		"synced": null,

		"included": null,

	}

	/** constructor **/

	// set up observable values.
	for(key in field_defaults){
		val = data ? data[key] : field_defaults[key];
		this[key] = ko.observable(val)
	}

	this.responses = {} // make responses a normal hash
	this.syncing = ko.observable(false);

	for(var mid in MEASURES){
		val = data ? data['responses'][mid] : null;
		this.responses[mid] = ko.observable(val);
	}

	// aviod the json function having all of the computed functions and methods
	this.data = function(){
		obj = ko.toJS(this);
		fields = Object.keys(field_defaults); // add in all the observables
		fields = fields.concat(['responses', "status"]);
		for(var key in obj){
			if(fields.indexOf(key) < 0){
				delete obj[key];
			}
		}
		return obj;
	}
    
	/** actions **/

	this.save = function(){
		this.participant_id(Participant.table().save(this.data()));
		this.date_modified(new Date().getTime());
		Participant.last_updated(new Date());
		if(!Participant._hash[this.participant_id()]){
			Participant._hash[this.participant_id()] = this;
		}
	}

	this.delete = function(){
		if(this.participant_id()){
				Participant.table().remove(this.participant_id());
				delete Participant._hash[this.participant_id()];
				Participant.last_updated(new Date());
				this.cleanup();
		}
	}

	this.cleanup = function(){
		// todo clean references to observables to free up memory
	}

	this.start_questionnaire = function(){
		this.questionnaire_started(new Date().getTime());
		this.participant_approached('yes');
		this.save();
		theApp.start_data(this);
	}

	this.continue_questionnaire = function(){
		theApp.start_data(this);	
	}

	this.sync = function(){
		Participant.sync_multi([this]);
	}

	this.sync_without_mark_as_synced = function(){
		Participant.sync_multi([this], true);
	}

	this.results_page = function(){
		theApp.results_page(this);
	}	

	this.set_consent = function(){
		if(this.consent_questions_agreed()){
			if(!this.consented()){
				this.consented(true);
				this.date_consented(new Date().getTime());
				this.study_id(Participant.next_consent_id());
			}
		} else {
			if(this.consented() == true){
				this.consented(null);
				this.date_consented(null);
			}
		}
	}

	this.complete_data = function(){
		this.completed(true);
		this.save();
	}


	this.reset_questionnaire = function(){
		this.questionnaire_step(null);
		this.consented(null);
	}

	/** calculation and status methods **/

	this.status = ko.computed(function(){
		status = 'added';
		if(this.participant_approached() == 'yes'){
			status = 'approached';
		}
		if(this.terminated() == true){
			status = 'terminated';
		} else if(this.participant_approached() == 'no'){
			status = 'not_approached';
		} else if(this.participant_approached() == 'not-yet'){
			status = 'not_yet_approached';
		} else if(this.questionnaire_started() != null){
			if(this.completed()){
				status = 'completed';
			} else if(this.included() == false){
				status = 'not_included';	
			} else if(this.consented() == false){
				status = 'not_consented';
			} else {
				status = 'in_progress';
			}
		}
		return status;
	}, this);


	this.inclusion_criteria_passed = ko.computed(function(){
		responses = this.responses;
		for(var i = 1; i < 6; i++){
			if(!responses['inclusion'+i]()) return false;
		}
		return true;
	},this);


  this.is_terminate_with_delete = ko.computed(function(){
  	return (this.terminated()==true) && (this.termination_type() == 'delete');
  }, this);

	this.consent_questions_agreed = ko.computed(function(){
		responses = this.responses;
		for(var i = 1; i < 7; i++){
			if(!responses['consent'+i]()) return false;
		}
		return true;
	}, this);

	this.can_start = ko.computed(function(){
		return (this.status() == 'approached' || this.status() == 'not_yet_approached');
	}, this);

	this.can_continue = ko.computed(function(){
		return (this.status() == 'in_progress');
	}, this);


	this.can_sync = ko.computed(function(){
		return (!this.synced()) // not already synched
				&& (!this.is_terminate_with_delete()) // not terminate delte
				&&  (
						[
							'completed','terminated',
							'not_approached',
							'not_included','not_consented',
						].indexOf(this.status()) > -1
					); // and in one of the statuses
	}, this);

	// if terminate delete is set, don't warn about not synching
	this.should_sync = ko.computed(function(){
		return !(this.synced() || this.can_sync() || this.is_terminate_with_delete());
	}, this);

	this.can_edit = ko.computed(function(){
		return ! this.synced();
	}, this);


	this.added_today = ko.computed(function(){
		if(this.date_added()){
			return moment(this.date_added()).isSame(moment(),'day');
		}
	}, this);

	this.filter_pass = ko.computed(function(){
		return this.consented() && this.responses["filter1"]() == true && this.responses["filter2"]() == true
	}, this);

	/** display methods **/

	this.form = function(){
		return new ParticipantForm(this);
	}

	this.date_added_str = ko.computed(function(){
		m = moment(this.date_added());
		return m.format('D MMM HH:mm');
	}, this);

	this.gender_str = ko.computed(function(){
		gender = {m: 'Male', f: 'Female'}[this.gender()];
		return gender || '';
	}, this);

	this.added_by_str = ko.computed(function(){
		 researcher = ResearcherModel.by_id[this.added_by_id()];
		 return researcher ? researcher.username : '';
	}, this);

	this.label_def = ko.computed(function(){
		return PARTICIPANT_STATUSES[this.status()]
	}, this);

	this.name_str = ko.computed(function(){
		this.date_modified();
		var first_name = this.first_name();
		var full_name = this.responses['full_name']();
		return first_name || full_name || "(No name provided)";
	},this)

}

Participant.table = function(){
	return new LSTable(PARTICIPANT_STORAGE_KEY, 'participant_id');
}

Participant.delete_all = function(){
	Participant.table().remove_all();
	// go through and delete each one from hash
	for(var id in Participant._hash){
		var participant = Participant._hash[id];
		delete Participant._hash[id];
		participant.cleanup();
	}
	Participant.last_updated(new Date());
}

Participant._hash = null; // this will be a hash containing key = participant_id and value = participant obejct

// return a hash with id as key
Participant.list = function(){
	if(!Participant._hash){
		Participant._hash = {};
		var participants = Participant.table().all();
		for(var i =0; i < participants.length; i++){
			var participant = new Participant(participants[i]);
			Participant._hash[participant.participant_id()] = participant;
		}
	}
	return Participant._hash;
}



Participant.last_updated = ko.observable(null);
Participant.last_synced = ko.observable(null);

Participant.for_id = function(i){
	// just get straight out of _hash
	return Participant._hash[i];
}

Participant.next_consent_id = function(){
	last_id = parseInt(localStorage[LAST_CONSENT_ID_STORAGE_KEY] || 0);
	id = last_id + 1;
	localStorage[LAST_CONSENT_ID_STORAGE_KEY] = id;
	return 'p' + id;
}

Participant.syncing_all = ko.observable(false);

Participant.sync_all = function(){
	Participant.syncing_all(true);
	var participants = Participant.list();
	to_sync = [];
	for(var i in participants){
		participant = participants[i];
		if(!participant.synced()){
			if((!participant.added_today() && !participant.is_terminate_with_delete()) || participant.can_sync()){
				to_sync.push(participant)
			}
		}
	}
	Participant.sync_multi(to_sync);
	Participant.last_updated(new Date());
}

Participant.sync_multi = function(participants, dont_mark_synced){
	var data = []
	for(var i = 0; i < participants.length; i++){
		var participant = participants[i];
		participant.syncing(true);
		data.push(participant.data());
	}
	WebApp.sync({participants: data}, function(result){
		// if data is returned we were succesful
		if(result){
			for(var i = 0; i < participants.length; i++){
				var participant = participants[i];
				if(! dont_mark_synced){
					participant.synced(true);
				}
				participant.save();
				Participant.last_synced(new Date());
			}
		}
		// cleanup whether successful or not
		for(var i = 0; i < participants.length; i++){
				var participant = participants[i];
				participant.syncing(false);
			}
			Participant.clean_old();
			Participant.syncing_all(false);
		}
	);
}

// delete any synced participants who were not added today
Participant.clean_old = function(){
	var participants = Participant.list();
	for(var i in participants){
		participant = participants[i];
		if((participant.synced() || participant.is_terminate_with_delete()) && ! participant.added_today()){
			participant.delete();	
		}
	}
}
