require 'test_helper'

class ParticipantsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @participant = participants(:one)
  end

  test "should get index" do
    get participants_url
    assert_response :success
  end

  test "should get new" do
    get new_participant_url
    assert_response :success
  end

  test "should create participant" do
    assert_difference('Participant.count') do
      post participants_url, params: { participant: { added_by_id: @participant.added_by_id, age: @participant.age, completed: @participant.completed, consented: @participant.consented, date_added: @participant.date_added, date_consented: @participant.date_consented, date_modified: @participant.date_modified, first_name: @participant.first_name, gender: @participant.gender, included: @participant.included, notes: @participant.notes, participant_id: @participant.participant_id, patient_approached: @participant.patient_approached, questionnaire_started: @participant.questionnaire_started, reason_not_approached: @participant.reason_not_approached, reason_not_approached_other: @participant.reason_not_approached_other, reason_terminated: @participant.reason_terminated, status: @participant.status, study_id: @participant.study_id, terminated: @participant.terminated, termination_type: @participant.termination_type } }
    end

    assert_redirected_to participant_url(Participant.last)
  end

  test "should show participant" do
    get participant_url(@participant)
    assert_response :success
  end

  test "should get edit" do
    get edit_participant_url(@participant)
    assert_response :success
  end

  test "should update participant" do
    patch participant_url(@participant), params: { participant: { added_by_id: @participant.added_by_id, age: @participant.age, completed: @participant.completed, consented: @participant.consented, date_added: @participant.date_added, date_consented: @participant.date_consented, date_modified: @participant.date_modified, first_name: @participant.first_name, gender: @participant.gender, included: @participant.included, notes: @participant.notes, participant_id: @participant.participant_id, patient_approached: @participant.patient_approached, questionnaire_started: @participant.questionnaire_started, reason_not_approached: @participant.reason_not_approached, reason_not_approached_other: @participant.reason_not_approached_other, reason_terminated: @participant.reason_terminated, status: @participant.status, study_id: @participant.study_id, terminated: @participant.terminated, termination_type: @participant.termination_type } }
    assert_redirected_to participant_url(@participant)
  end

  test "should destroy participant" do
    assert_difference('Participant.count', -1) do
      delete participant_url(@participant)
    end

    assert_redirected_to participants_url
  end
end
