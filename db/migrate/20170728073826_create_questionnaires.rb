class CreateQuestionnaires < ActiveRecord::Migration[5.1]
  def change
    create_table :questionnaires do |t|
      t.text :responses
      t.references :participant

      t.timestamps
    end
  end
end
