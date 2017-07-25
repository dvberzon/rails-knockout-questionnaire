require 'test_helper'

class WebappsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get webapps_show_url
    assert_response :success
  end

end
