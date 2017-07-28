class CreateParticipants < ActiveRecord::Migration[5.1]
  def change
    create_table :participants do |t|
      t.integer :added_by_id
      t.string :age
      t.datetime :questionnaire_started
      t.boolean :completed
      t.boolean :consented
      t.datetime :date_added
      t.datetime :date_consented
      t.datetime :date_modified
      t.string :first_name
      t.string :gender
      t.boolean :included
      t.text :notes
      t.integer :participant_id
      t.boolean :patient_approached
      t.string :reason_not_approached
      t.string :reason_not_approached_other
      t.string :reason_terminated
      t.string :status
      t.string :study_id
      t.boolean :terminated
      t.string :termination_type

      t.timestamps
    end
  end
end
