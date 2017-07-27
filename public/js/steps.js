STEP_ORDER = [
  'inclusion',
  'inclusion_n',
  'explanation',
  'consent',
  'consent_n',
  'consent_n_thanks',
  "contact",
  "demographics2",
  "filter",
  "ageFirst",
  "apple_frequency",
  "apple_attitude",
  "apple_likelihood",
  "apple_association",
  "apple_phrases",
  "apple_meter",
  "thankyou",
]

STEPS = {

  "inclusion": {
    "title":"Inclusion  & Exclusion criteria",
    "intro":"Does the particiant fulfill all of these criteria?",
    "measures":[
      "inclusion_intro",
      "inclusion1",
      "inclusion2",
      "inclusion3",
      "inclusion4",
      "inclusion5"
    ],
    "researcher_step":true,
    "finish_func": function(participant){
      if(participant.inclusion_criteria_passed()){
        participant.included(true);
      }
    }
  },
  "inclusion_n": {
    "title":"Inclusion Failure",
    "intro":"You have indicated a NO to at least one item, this means that the particiant is <span class='label label-danger'>not</span> eligible to participate. Click finish to confirm.",
    // only visible if the participant is under 16 and not accompanied
    "visible_if": function(participant){
      return !participant.inclusion_criteria_passed();
    },
    "researcher_step":true,
    "finish_func": function(participant){
      participant.included(false);
    }
  },
  "explanation": {
    "title":"Research Explanation",
    "intro":"<p>This particiant is eligible to participate. Now take some time to explain the research to them, making clear who is conducting the research and why they are interested in apples</p>"
        +"<h3 class='text-success text-center'>When you have finished, please press next and hand the consent form to the participant</h3>",
    "researcher_step":true
  },
  "consent": {
    "title":"Participant Consent Form",
    "intro":"Please read and indicate your agreement with each statement by ticking the box",
    "no_back": true,
    "measures":[
      "consent1",
      "consent2",
      "consent3",
      "consent4",
      "consent5",
      "consent6",
    ],
    "finish_func": function(participant){
      participant.set_consent();
    },
  },
  "consent_n": {
    "title":"Not Consented",
    "intro":"<p>You have not agreed to all of the consent statements. This means that you have <span class='label label-danger'>not</span> provided consent to participate in the study.</p>"
        +"<p>If you wish to take part in the study, please click BACK to return to the previous page and agree all of the statements. Otherwise click NEXT.</p>",
    // only visible if the participant is under 16 and not accompanied
    "visible_if": function(participant){
      return participant.consented()==null;
    },
    "finish_func": function(participant){
      return participant.consented(false);
    }
  },  
  "consent_n_thanks": {
    "title":"Thank you",
    "intro":"<p>Thank you very much for your time.</p>"
        +"<p>Please hand the ipad back to the researcher.</p>",
    // only visible if the participant is under 16 and not accompanied
    "visible_if": function(participant){
      return !participant.consented();
    }
  },
  "contact": {
    "title":"Contact Information",
    "intro":"To participate we need to ask you for the following contact information.",
    "measures":[
      "full_name",
      "email",
      "mobile_number",
      "home_telephone"
    ],
    "visible_if": function(participant){
      return participant.consented();
    },
    "completed_if":function(participant){
      mandatory = ['full_name', 'email'];
      for(var i = 0; i < mandatory.length; i++){
        value = participant.responses[mandatory[i]]();
        if(value == null || value == "") return false;
      }
      // must give one of the two phone numbers
      email = participant.responses['email']();
      
      // email must be valid
      if(email != null && email.length > 0){
        return isEmail(email)
      }

      return true;
    }
  },

  "demographics2": {
    "title":"Tell us about yourself",
    "measures":[
      "age",
      "gender",
      "employment_status"
    ],
    "visible_if": function(participant){
      return participant.consented();
    }
  },

  "filter": {
    "measures":[
      "filter1",
      "filter2",
      "past24",
      "pasthour"
    ],
    "visible_if": function(participant){
      return participant.consented();
    },
    "completed_if": function(participant){
      return participant.responses["filter1"]() == false ||
      (participant.responses["filter1"]() == true && participant.responses["filter2"]() != null);
      // the other two questions are not mandatory
    }
  },

  "ageFirst": {
    "measures":[
      "ageFirst"
    ],
    "visible_if":function(participant){
      return participant.consented() && participant.responses["filter1"]() == true;
    }
  },

  "apple_frequency": {
    "intro":"These questions ask about any apples you have eaten in the <strong>last 6 months</strong>. An apple refers to a single piece of fruit, if you ate apple slices or pieces, try to estimate the number of whole apples",
    "measures":[
      "apple_frequency_1",
      "apple_frequency_2",
      "apple_frequency_3"
    ],
    "visible_if":function(participant){
      return participant.filter_pass();
    }
  },

  "apple_attitude": {
    "intro":"Please indicate how much you agree with each of the following statements in relation to your own apple consumption",
    "measures":[
      "apple_attitude_1",
      "apple_attitude_2",
      "apple_attitude_3",
      "apple_attitude_4",
      "apple_attitude_5",
      "apple_attitude_6",
    ],
    "visible_if":function(participant){
      return participant.filter_pass();
    }
  },

  "apple_likelihood": {
    "intro":"For each of the following situations, please indicate how likely they are to apply to you within the <strong>next week</strong>",
    "measures":[
      "apple_likelihood_1",
      "apple_likelihood_2",
      "apple_likelihood_3",
      "apple_likelihood_4",
      "apple_likelihood_5",
    ],
    "visible_if":function(participant){
      return participant.filter_pass();
    }
  },

  "apple_association": {
    "intro":"Please answer the following questions about apples in general",
    "measures":[
      "apple_association",
      "apple_association_other",
    ],
     "visible_if": function(participant){
      return participant.consented();
    },
  },

  "apple_phrases": {
    "intro":"Please indicate how likely you are to use the following phrases",
    "measures":[
      "apple_phrases_1",
      "apple_phrases_2",
      "apple_phrases_3",
      "apple_phrases_4",
      "apple_phrases_5",
      "apple_phrases_6",
    ],
     "visible_if": function(participant){
      return participant.consented();
    },
  },

  "apple_meter" : {
    "intro":"We would like to know how important apples are to you",
    "measures":[
      "apple_meter",
    ],
    "visible_if": function(participant){
      return participant.consented();
    }
  },

  "thankyou": {
    "title":"Thank you",
    "intro":"Thank you for taking time to answer our survey. Please return the device to the researcher.",
    "final_step":true,
    "measures":[],
    "visible_if": function(participant){
      return participant.consented();
    }
  }
}