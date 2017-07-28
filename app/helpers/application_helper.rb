module ApplicationHelper
  def active_class_attribute *paths
    if link_active? *paths
      "class='active'".html_safe
    end
  end

  def active_class *paths
    if link_active? *paths
      "active"
    end
  end

  def link_active? *paths
    active = false
    paths.each do |path|
      path_arr = path.split('#')
      active = true if controller_name == path_arr[0]
      if active and ! path_arr[1].blank?
        active = false unless action_name == path_arr[1]
      end
    end
    active
  end
end
