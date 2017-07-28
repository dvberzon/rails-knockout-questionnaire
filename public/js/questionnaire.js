// internet standard rfc822 email regex
// taken from http://badsyntax.co/post/javascript-email-validation-rfc822
function isEmail(email){
        return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test( email );
}

// define the wizard functions referenced in the measures and steps yaml
// E.G visible_if: likes_apples
// These will be applied to the Step and Measure models
var wizard_functions = {
  
  // step functions
  inclusion_finished: function(participant){
    if(participant.inclusion_criteria_passed()){
      participant.included(true);
    }
  },

  inclusion_failed: function(participant){
    return !participant.inclusion_criteria_passed();
  },

  inclusion_n_finished: function(participant){
    participant.included(false);
  },

  included: function(participant){
      return participant.inclusion_criteria_passed();
  },

  consent_finished: function(participant){
    participant.set_consent();
  },

  consented_null: function(participant){
    return participant.included() && participant.consented()==null;
  },

  consent_n_finished: function(participant){
    return participant.consented(false);
  },

  not_consented: function(participant){
    return participant.included() && !participant.consented();
  },

  consented: function(participant){
      return participant.consented();
  },

  contact_completed :function(participant){
    mandatory = ['full_name', 'email'];
    for(var i = 0; i < mandatory.length; i++){
      value = participant.responses[mandatory[i]]();
      if(value == null || value == "") return false;
    }
    // email must be valid
    email = participant.responses['email']();
    
    if(email != null && email.length > 0){
      return isEmail(email)
    }

    return true;
  },

  filter_completed: function(participant){
    return participant.responses["filter1"]() == false ||
    (participant.responses["filter1"]() == true && participant.responses["filter2"]() != null);
    // the other two questions are not mandatory
  },

  age_first_visible: function(participant){
    return participant.consented() && participant.responses["filter1"]() == true;
  },

  filter_pass: function(participant){
    return participant.filter_pass();
  },

  // measure functions
  filter2_visible: function(responses){
    return responses['filter1']() ==true;
  },

  past24_visible: function(responses){
    return (responses['filter1']() ==true) && (responses['filter2']() ==true);
  },

  past_hour_visibe: function(responses){
    return (responses['filter1']() ==true) && (responses['filter2']() ==true) && (responses['past24']() ==true);
  },
  
  apple_association_other_visible: function(responses){
    return (responses['apple_association']() =='other');
  },

  age_first_filter: function(options, responses){
    age = responses['age']();
    if(!age){
      return options; 
    }else{ 
      newOptions = [];
      for(var i = 0; i < options.length; i++){
        if(age == options[i]['value']) break; // don't include options for the users age or above
        newOptions.push(options[i]);
      }
      return newOptions;
    }
  }

}


/**  a special ko binding handler for a slider **/
ko.bindingHandlers.slider = {
	 init: function(element, valueAccessor, allBindingsAccessor) {
	 	$(element).noUiSlider({
			start: 50,
			range: {
				'min': 0,
				'max': 100,
			},
			format: {
				decimals: 0,
			},
			orientation: 'vertical',
			direction: 'rtl',
			step: 1
		}).change(function(){
			valueAccessor()(parseInt($(this).val()).toFixed(0));
		});

	 }
}