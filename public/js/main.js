/** main app javascript goes here **/

LoginPage = function(){
	this.researcherList = new ResearcherList();
	this.pin = ko.observable(null);
	this.page_title = 'Please choose a researcher from the list and enter your password';
	this.not_on_home_screen = function(){
		return ("standalone" in window.navigator) && !window.navigator.standalone
	}
	this.login = function(){
		var researcher = this.researcherList.selected_researcher();
		if(researcher){
			if(researcher.check_password(this.pin())){
				theApp.login(researcher);
			} else {
				alert('login failed');
			}
		}
	};
}

AdminPage = function(){
	this.editing_participant = ko.observable(null);
	this.last_updated = ko.observable(new Date());

	this.participant_list = new ParticipantList(this);
	this.activity_panel = new ActivityPanel(this);	

	this.page_title = ko.computed(function(){
		participant = this.editing_participant();
		if(participant){
			return 'Details for Participant id: ' + participant.participant_id() + ' (' + (participant.first_name() || 'unnamed participant') + ')';
		}else{
			return 'Participant Administration';
		}
	}, this);
	
	this.done = function(){
		this.editing_participant().save();
		this.editing_participant(null);
		this.last_updated(new Date());
	}

	this.logout = function(){
		this.editing_participant(null);
		theApp.current_researcher(null);
	}
}

QuestionnairePage = function(){
	this.participant = theApp.current_participant();
	this.wizard = new Wizard();

	this.page_title = ko.computed(function(){
		return 'Participant details for ' + this.participant.participant_id() + ' ' + this.participant.name_str();
	},this);
	this.subtitle = ko.computed(function(){
		if(this.wizard && this.wizard.current_step()){
			return this.wizard.current_step().title;
		}
	},this);

	this.cleanup = function(){
		this.page_title.dispose();
		this.subtitle.dispose();
		this.wizard.cleanup();
	}
}


/** the main application */
AppModel = function(){
	this.current_researcher = ko.observable(null);
	//this.current_researcher = ko.observable(ResearcherModel.researchers['1234']);
	this.current_participant = ko.observable(null); // the current questionnaire participant
	this.current_page = ko.observable(new AdminPage());
	this.dev_panel = ko.observable(null);
	this.online = ko.observable(navigator.onLine);
	this.update_ready = ko.observable(null);
	this.update_ready_date = ko.observable(null);
	this.dev_mode = ko.observable(false);

	this.page = ko.computed( function(){
		if(this.current_researcher()){
			return this.current_page();
		}else{
			return new LoginPage(this);
		}
	}, this);

	
	
	this.login = function(researcher){
		researcher.logged_in();
		this.current_researcher(researcher);
		if(this.current_page() && typeof(this.current_page().logged_in) == (typeof(Function))){
			this.current_page().logged_in();
		}		
	}
	
	this.start_data = function(participant){
		this.current_participant(participant);
		this.current_page(new QuestionnairePage());
	}

	this.save_data = function(){
		this.current_participant().save();
		this.current_participant(null);
		this.current_researcher(null);
		this.current_page().cleanup();
		this.current_page(new AdminPage());
	}

	this.finish_data = function(){
		this.current_participant().complete_data();
		this.current_participant(null);
		this.current_researcher(null);
		this.current_page().cleanup();
		this.current_page(new AdminPage());
	}

	this.check_for_update = function(){
		if(navigator.onLine){
			window.applicationCache.update();
			window.applicationCache.addEventListener('updateready', function(e){
				window.applicationCache.swapCache();
				theApp.update_ready('ready');
				theApp.update_ready_date(new Date());
			});
			window.applicationCache.addEventListener('noupdate',function(e){
				theApp.update_ready('none');
				theApp.update_ready_date(new Date());
			});
		}
	}

	this.update_cache = function(){
		window.location.reload();
		this.update_ready(null);
	}

	this.online_timeout = null;
	this.check_online = function(){
		//this.online(navigator.onLine);
		this.online(true);
		this.online_timeout = setTimeout(function(){theApp.check_online()}, 10000); // check if we're online every 10s
	}

	this.check_online();

}


$(function(){
	FastClick.attach(document.body);
	WebApp.sync({}, function(){
		theApp = new AppModel();
		ko.applyBindings(theApp);
		$('#application').show();
	});
});