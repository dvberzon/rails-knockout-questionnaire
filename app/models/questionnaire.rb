class Questionnaire < ApplicationRecord
  MEASURES = [:inclusion1, :inclusion2, :inclusion3, :inclusion4, :inclusion5, 
    :consent1, :consent2, :consent3, :consent4, :consent5, :consent6, :full_name, :email, 
    :mobile_number, :home_telephone, :gender, :age, :employment_status, 
    :filter1, :filter2, :past24, :pasthour, :age_first, :apple_frequency_1, :apple_frequency_2, 
    :apple_frequency_3, :apple_attitude_1, :apple_attitude_2, :apple_attitude_3, :apple_attitude_4, 
    :apple_attitude_5, :apple_attitude_6, :apple_likelihood_1, :apple_likelihood_2, :apple_likelihood_3, 
    :apple_likelihood_4, :apple_likelihood_5, :apple_association, :apple_association_other, 
    :apple_phrases_1, :apple_phrases_2, :apple_phrases_3, :apple_phrases_4, :apple_phrases_5, 
    :apple_phrases_6, :apple_meter]
  store :responses, :accessors => MEASURES
end
