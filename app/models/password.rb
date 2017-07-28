class Password
	
  LENGTH_SALT = 4
  NUM_ITERATIONS = 10
  
  def self.encode plain_text
  	salt = self.random_salt
  	hash = salt + plain_text
  	NUM_ITERATIONS.times do
  		hash = Digest::SHA1.hexdigest hash
  	end
  	"#{salt}#{hash}"
  end
  
  def self.random_salt
  	SecureRandom.hex[0...LENGTH_SALT]
  end

end
