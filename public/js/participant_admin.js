/** code for rendering the participant admin pages **/

REASONS_NOT_APPROACHED = [
	{value: null, name: ''},
	{value: 'unwilling', name: 'Participant unwilling to be approached'},
	{value: 'communication_barrier', name: 'Communication barrier'},
	{value: 'safety', name: 'Researcher perceived personal safety issue'},
	{value: 'other', name: 'Other'}
];

REASONS_TERMINATED = [
	null,
	'Initial disinterest',
	'Particiant withdrew consent',
	'Parent withdrew consent',
	'Particiant left without completing'
];

AGES = [
	{value: '16_18', name:'16 to 18'},
	{value: '19_24', name:'19 to 24'},
	{value: '25_34', name:'25 to 34'},
	{value: '35_44', name:'35 to 44'},
	{value: '45_60', name:'45 to 60'},
	{value: 'over60', name: 'Over 60'}
];



ActivityPanel = function(adminPage){
	this.adminPage = adminPage;
	this.data = ko.computed(function(){

		// force recalculate on update
		// do this by referencing admin page updated observable
		Participant.last_updated();
		// or when page changes, but only if the current page is the admin page
		if(typeof theApp == 'undefined' || theApp.current_page() instanceof AdminPage){
		stats = {
			num_added: 0,
			num_approached: 0,
			male: 0,
			female: 0,
			age_16_18: 0,
			age_19_24: 0,
			age_25_34: 0,
			age_35_44: 0,
			age_45_60: 0,
			age_over60: 0,
			age_14: 0,
			age_15: 0,
			age_16: 0,
			age_17: 0,
			not_approached: 0,
			included: 0,
			not_included: 0,
			consented: 0,
			terminated: 0,
			gillick_failed: 0,
			not_consented: 0,
			completed: 0,
			synced: 0,
			can_sync: 0,
			cant_sync: 0,
			old_unsynced: 0
		}
		participants = Participant.list();
		for(var i in participants){
			participant = participants[i];
			if(participant.added_today()){
				stats['num_added'] += 1;

				if(participant.participant_approached() == 'yes'){
					stats['num_approached'] += 1;
					if(participant.gender() == 'm'){
						stats['male'] += 1;
					}
					if(participant.gender() == 'f'){
						stats['female'] += 1;
					}
					if(age = participant.age()){
						if(stats['age_' + age] != null){
							stats['age_' + age] += 1;
						}
					}
					if(participant.consented() == true){
						stats['consented'] += 1;
					}
					if(participant.consented() == false){
						stats['not_consented'] += 1;
					}
				}else if(participant.participant_approached() == 'no'){
					stats['not_approached'] += 1;
				}
				if(participant.included() == true){
					stats['included'] += 1;
				}
				if(participant.included() == false){
					stats['not_included'] += 1;
				}
				if(participant.completed()){
					stats['completed'] += 1;
				}
				if(participant.terminated()){
					stats['terminated'] += 1;
				}
				if(participant.synced()){
					stats['synced'] += 1;
				}else{
					if(participant.can_sync()){
						stats['can_sync'] += 1;
					}else if(participant.should_sync()){
						stats['cant_sync'] += 1;
					}
				}
			} else { // not added today
				if(!participant.synced()){
					stats['old_unsynced'] +=1;
				}
			}
		}
		return stats;
		}
	}, this);
}

ParticipantForm = function(participant){

	this.gender_buttons = function(){
		obs = participant.gender
		return [
			new RadioButton({name: 'Male', value: 'm'}, obs),
			new RadioButton({name: 'Female', value: 'f'}, obs)
		]
	}

	this.accompanied_buttons = function(){
		obs = participant.accompanied_by_guardian
		return [
			new RadioButton({name: 'Yes', value: true}, obs),
			new RadioButton({name: 'No', value: false, negative: true}, obs)
		]	
	}

	this.approached_buttons = function(){
		obs = participant.participant_approached
		return [
			new RadioButton({name: 'Yes', value: 'yes'}, obs),
			new RadioButton({name: 'No', value: 'no', negative: true}, obs),
			new RadioButton({name: 'Not yet', value: 'not-yet', negative: true}, obs)
		]	
	}

	this.terminated_buttons = function(){
		obs = participant.terminated
		return [
			new RadioButton({name: 'Yes', value: true}, obs),
			new RadioButton({name: 'No', value: false, negative: true}, obs)
		]		
	}

	this.termination_type_buttons = function(){
		obs = participant.termination_type
		return [
			new RadioButton({name: 'Retain data', value: 'retain'}, obs),
			new RadioButton({name: 'Delete data', value: 'delete', negative: true}, obs)
		]		
	}


}


ParticipantList = function(adminPage){
	this.adminPage = adminPage;

	this.list = ko.computed(function(){
		// update whenever participant updates
		Participant.last_updated();
		// or when page changes, but only if the current page is the admin page
		if(typeof theApp == 'undefined' || theApp.current_page() instanceof AdminPage){
		var list = [];
		participants = Participant.list();
		for(id in participants){
			participant = participants[id];
			if(participant.added_today()){
				list.push(participant);
			}
		}
		return list;
		}
	});

	this.edit = function(i){
		participant = this.list()[i];
		adminPage.editing_participant(participant);
	}

	this.new_participant = function(){
		var participant = new Participant();
		participant.added_by_id(theApp.current_researcher().id);
		//this.list.push(participant);
		participant.save();
		adminPage.editing_participant(participant);
	}

	this.start_questionnaire = function(i){
		participant = this.list()[i];
		participant.start_questionnaire();
	}

	this.continue_questionnaire = function(i){
		participant = this.list()[i];
		participant.continue_questionnaire();
	}

	this.results_page = function(i){
		participant = this.list()[i];
		participant.results_page();
	}
}