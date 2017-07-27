class WebappsController < ApplicationController
  layout 'webapp'
  protect_from_forgery :except => ['sync']

  def show
    @steps_yaml = YAML.load_file("#{Rails.root}/config/steps.yml")
  end

  def sync
    data = {
      researchers: [
        {"id":1,"username":"testuser","password":"07f6fe01b008dde0e398666ed74c773692052105ba58"}
      ]
    }
    render :json => data
  end
end
