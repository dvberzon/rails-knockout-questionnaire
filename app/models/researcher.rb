class Researcher < ApplicationRecord
  validates :username, :uniqueness => true


  before_save do |record|
    record.password = Password.encode(record.password_plaintext) if(!record.password_plaintext.blank?)
  end

  attr_accessor :password_plaintext

end
