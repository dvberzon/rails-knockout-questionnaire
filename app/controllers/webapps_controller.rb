class WebappsController < ApplicationController
  layout 'webapp'
  protect_from_forgery :except => ['sync']

  def show
    @install = Install.for_session session
    @steps_yaml = Questionnaire.steps_yaml
    @measures_yaml = Questionnaire.measures_yaml
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
      researchers: Researcher.all.as_json(only: [:id, :username, :password])
    }
    render :json => data
  end

  def appcache
    render 'appcache', :layout=> nil, :content_type => 'text/cache-manifest'
  end
end
