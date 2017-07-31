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

  def response_data
    steps_yaml = Questionnaire.steps_yaml
    measures_yaml = Questionnaire.measures_yaml
    
    steps_yaml['STEP_ORDER'].map do |step|
      step_def = steps_yaml['STEPS'][step]
      if step_def
        measure_ids = step_def['measures']
        unless measure_ids.blank?
          measures = measure_ids.map do |mid|
            measure = Questionnaire::Measure.new(mid, measures_yaml)
            if measure
              # reponse value is an accessor on the responses store
              value = self.try(mid)
              {id: mid, value: measure.value_str(value)}
            end
          end
          # output step and measures
          {id: step, measures: measures}
        end
      end
    end.compact
  end

  def self.steps_yaml
    @step_yaml ||= load_yaml('steps')

  end

  def self.measures_yaml
    @measures_yaml ||= load_yaml('measures')
  end

  def self.load_yaml name
    expire_time = APP_CONFIG['cache_yaml'] ? 1.hour : 1.second
    Rails.cache.fetch("#{name}_yaml", expires_in: expire_time) do
      YAML::load(File.open("#{Rails.root}/config/#{name}.yml"))
    end
  end

  # nested class for measure display
  class Measure
    attr_accessor :id
    def initialize id, yaml
      measure_def = yaml['MEASURES'][id]
      if(measure_def)
        @id = id
        @type = measure_def['type']
        @options = measure_def['options']
        if(@options.nil? and yaml['option_sets'])
            @options = yaml['option_sets'][measure_def['option_set']]
        end
      end
    end

    def value_str value
      if @options
        @options.select{|o| o['value'] == value}.first.try('[]','name')
      else
        value
      end
    end

    def include?
      @type != 'info'
    end
  end
end
