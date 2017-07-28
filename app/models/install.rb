class Install < ApplicationRecord

  def self.for_session session
    Install.where(session: session.id).first_or_create
  end
end
