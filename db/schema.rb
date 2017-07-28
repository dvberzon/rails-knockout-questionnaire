# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170728073826) do

  create_table "participants", force: :cascade do |t|
    t.integer "added_by_id"
    t.string "age"
    t.datetime "questionnaire_started"
    t.boolean "completed"
    t.boolean "consented"
    t.datetime "date_added"
    t.datetime "date_consented"
    t.datetime "date_modified"
    t.string "first_name"
    t.string "gender"
    t.boolean "included"
    t.text "notes"
    t.integer "participant_id"
    t.boolean "patient_approached"
    t.string "reason_not_approached"
    t.string "reason_not_approached_other"
    t.string "reason_terminated"
    t.string "status"
    t.string "study_id"
    t.boolean "terminated"
    t.string "termination_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "questionnaires", force: :cascade do |t|
    t.text "responses"
    t.integer "participant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["participant_id"], name: "index_questionnaires_on_participant_id"
  end

end
