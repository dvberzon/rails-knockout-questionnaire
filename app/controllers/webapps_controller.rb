class WebappsController < ApplicationController
  layout 'webapp'
  protect_from_forgery :except => ['sync']

  def show
    @steps_yaml = YAML.load_file("#{Rails.root}/config/steps.yml")
    @measures_yaml = YAML.load_file("#{Rails.root}/config/measures.yml")
  end

  def sync
    if(params[:participants])
      # params[:participants].permit! # permit all sub parameters of participants.
      params[:participants].each do |index, p|
        participant = Participant.from_params p
        if participant
          participant.save
        end
      end
    end
    data = {
      researchers: [
        {"id":1,"username":"testuser","password":"07f6fe01b008dde0e398666ed74c773692052105ba58"}
      ]
    }
    render :json => data
  end
end
