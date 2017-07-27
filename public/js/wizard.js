Step = function(id, step_def){
	this.id = id;
	this.title = step_def.title;
	this.intro = step_def.intro;
	this.image = step_def.image;
	this.measures = ko.observableArray();
	this.visible_if = wizard_functions[step_def.visible_if];
	this.finish_func = wizard_functions[step_def.finish_func];
	this.start_func = wizard_functions[step_def.start_func];;
	this.completed_if = wizard_functions[step_def.completed_if];;
	this.no_back = step_def.no_back;
	this.no_next = step_def.no_next;
	this.researcher_step = step_def.researcher_step;
	this.final_step = step_def.final_step;
	this.participant = theApp.current_participant();

	if(step_def.measures){
		for(var i = 0; i < step_def.measures.length; i++){
			measure_def = step_def.measures[i];
			var mes = new Measure(measure_def)
			this.measures.push(mes);
		}
	}

	this.visible = ko.computed(function(){ // this needs cleanup
		if(this.visible_if && this.participant){
			var vis = this.visible_if(this.participant);	
			return vis;
		} 
		return true;
	}, this);

	this.completed = ko.computed(function(){
		if(this.participant && this.completed_if){
			var completed = this.completed_if(this.participant);
			return completed;
		}
		// for the moment, all questions are optional
		for(var i = 0; i < this.measures().length; i++){
			if(!this.measures()[i].completed()){
				return false;	
			} 
		}
		return true;
	},this);
	
	// clean up code to run after the step
	this.finish = function(){
		if(this.finish_func) this.finish_func(theApp.current_participant());
	}
	this.start = function(){
		if(this.start_func) this.start_func(theApp.current_participant());
	}

	this.cleanup = function(){
		this.visible.dispose();
		this.completed.dispose();
		for(var i = 0; i < this.measures().length; i++){
			this.measures()[i].cleanup();
		}
	}
}

var RadioButton = function(option, obs, selected_value){
	this.name = option.name;
	this.value = option.value;
	this.negative = option.negative;
	this.obs = obs;

	// if a selected value wasn't passed in, use the observable.
	// this prevents radio buttons used outside the questionnaire from breaking
	if(selected_value != null){
		this.selected_value = selected_value;
	}else{
		this.selected_value = obs;
	}
	
	this.checked = ko.computed(function(){
		return this.value == this.selected_value(); // use selected value to decouple computed from the long living participant observable
	}, this);
	this.css = ko.computed(function(){
		if(this.checked()){
			return "btn " + (this.negative ? "btn-danger" : "btn-success");
		}else{
			return "btn btn-default";
		}
	}, this);
	this.icon = ko.computed(function(){
		if(this.checked()){
			
			return "fa fa-check-square-o";
		}else{
			return "fa fa-square-o";
		}
	}, this);
	this.select = function(){
		if(this.checked()){
			this.obs(null);
			this.selected_value(null); // update selected value
		}else{
			this.obs(this.value);
			this.selected_value(this.value) // update selected value
		}
		
	}

	this.cleanup = function(){
		this.checked.dispose();
		this.css.dispose();
		this.icon.dispose();
	}
}

var Measure = function(measure_id){
	measure_def = MEASURES[measure_id];
	this.id = measure_id;
	this.title = measure_def.title;
	this.text = measure_def.text;
	this.type = measure_def.type;
	this.style = measure_def.style;
	this.options = measure_def.option_set ? OPTION_SETS[measure_def.option_set] : measure_def.options;
	this.mandatory = measure_def.mandatory;
	this.participant = theApp.current_participant();

	
	var persisted_value = this.participant.responses[this.id]()
	
	this.local_value = ko.observable(persisted_value);
	this.option_filter = wizard_functions[measure_def.option_filter];
	this.visible_if = wizard_functions[measure_def.visible_if];

	this.btns = null;
	this.value = ko.computed({
        read: function () {
            return this.local_value();
        },
        write: function (value) {
        	this.local_value(value);
        	this.participant.responses[this.id](value);
        	this.participant.save();
        },
        owner: this
    });
	this.filtered_options = ko.computed(function(){
		if(this.option_filter && this.participant){
			return this.option_filter(this.options, this.participant.responses);
		}else{
			return this.options;
		}
	}, this);
    this.radio_buttons = function(){
    	
    	// make sure radio buttons only gets called once.
    	if(this.btns == null){
    		var selected_value = ko.observable(this.local_value());
			this.btns = [];
			if(this.options){
				for(var i = 0; i < this.filtered_options().length; i++){
					this.btns.push(new RadioButton(this.filtered_options()[i], this.value, selected_value));
				}
			}
		}
		return this.btns;
	}
	this.num_options_css = ko.computed(function(){
		if(this.filtered_options()){
			return "num_options_" + this.filtered_options().length;
		}
	}, this);
	this.visible = ko.computed(function(){
		if(this.visible_if && this.participant){
			if(this.visible_if(this.participant.responses)){
				return true;
			}
			return false;
		}else{
			return true;
		}
	}, this);
	

	// a measure is completed if it is not mandatory, or mandatory and filled in
	this.completed = ko.computed(function(){
		if(this.mandatory){
			return this.value() !== null;
		}
		return true;
	},this);

	this.cleanup = function(){
		this.value.dispose();
		this.filtered_options.dispose();
		this.num_options_css.dispose();
		this.visible.dispose();
		if(this.btns){
			for(var i = 0; i < this.btns.length; i++){
				this.btns[i].cleanup();
			}
		}
	}
}

Wizard = function(){

	this.steps = {};
	for (var id in STEPS) {
		var step_def = STEPS[id];
		var step = new Step(id, step_def);
		this.steps[id] = step;
	}

	this.step_at_index = function(index) {
		return this.steps[STEP_ORDER[index]]
	}

	/** navigation code **/

	this.next_visible_index = function(current_index) {
		for (var i = current_index+1; i < STEP_ORDER.length; i++) {
			step = this.step_at_index(i);
			if (step && step.visible()) return i;
		}
		return null;
	}

	this.prev_visible_index = function(current_index) {
		for (var i = current_index-1; i >=0; i--) {
			step = this.step_at_index(i);
			if (step.visible()) return i;
		}
		return null;
	}

	// instantiate with last page the participant was on, or first visible page
	first_step = theApp.current_participant().questionnaire_step() || this.next_visible_index(-1);
	this.current_index = ko.observable(first_step); 

	this.current_step = ko.computed(function() {
		cstep =  this.step_at_index(this.current_index());
		return cstep;
	}, this);


	this.has_next = ko.computed(function() {
		return !this.current_step().no_next && this.next_visible_index(this.current_index()) != null;
	}, this);

	this.has_prev = ko.computed(function() {
		return !this.current_step().no_back && this.prev_visible_index(this.current_index()) != null;
	}, this);

	this.prev = function() {
		this.current_index(this.prev_visible_index(this.current_index()));
	}

	this.next = function() {
			if(this.has_next()) {
				this.current_step().finish();

				this.current_index(this.next_visible_index(this.current_index()));
				theApp.current_participant().questionnaire_step(this.current_index());
				theApp.current_participant().save();
				this.current_step().start();

			}
	}

	this.progress_percentage = ko.computed(function() {
		// we only want to show progress based on participant facing steps
		// work out how many participant facing steps have been completed and how many there are in total
		completed = 0;
		total = 0;
		for (var i = 0; i < STEP_ORDER.length; i++) {
			step = STEPS[STEP_ORDER[i]];
			if (!step.researcher_step) {
				if(i <= this.current_index()) completed += 1;
				total += 1;
			}
		}
		return ((completed / total) * 100).toFixed(0) + '%';
	}, this);

	this.save = function() {
			theApp.save_data();
	}

	this.finish = function() {
		this.current_step().finish();
		if (this.current_step().final_step) {
			theApp.finish_data();
		} else {
			theApp.save_data();
		}
	}


	this.cleanup = function(){
		// no local computeds with participant
		for(var i in this.steps){
			this.steps[i].cleanup();
		}
	}
}