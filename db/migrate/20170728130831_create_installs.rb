class CreateInstalls < ActiveRecord::Migration[5.1]
  def change
    create_table :installs do |t|
      t.string :session

      t.timestamps
    end
  end
end
