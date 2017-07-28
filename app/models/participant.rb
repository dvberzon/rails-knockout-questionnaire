class Participant < ApplicationRecord
  has_one :questionnaire

  def self.from_params params
    if(params[:participant_id] and params[:install_id])
      participant = Participant.where(
        participant_id: params[:participant_id],
        install_id: params[:install_id]
      ).first_or_create
      params.each do |field, value|
        if value
          case field
          when 'date_added', 'date_modified', 'questionnaire_started', 'date_consented'
            # this is a javascript date in the form of miliseconds!
            date = Time.at(value.to_i/1000).to_datetime
            participant.send("#{field}=", date)
          when 'responses'
            questionnaire = participant.build_questionnaire
            questionnaire.responses = value
          else
            participant.send("#{field}=", value) if(participant.respond_to? field)
          end
        end
      end
      participant
    end
  end
end
