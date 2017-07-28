Rails.application.routes.draw do
  resources :participants
  resource :webapp do
    member do
      post :sync
    end
  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
