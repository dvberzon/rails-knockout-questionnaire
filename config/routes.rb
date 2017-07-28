Rails.application.routes.draw do
  root to: 'home#index'

  resources :participants
  resource :webapp do
    member do
      post :sync
    end
  end

  get 'rkq.appcache' => 'webapps#appcache'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
