/** webapp storage **/
WEBAPP_STORAGE_KEY = 'rails-knockout-questionnaire-v1';
INSTALL_KEY = 'rails-knockout-questionnaire-install-v1';

WebApp = function(){

}

WebApp.ls_hash = function(){
	return new LocalStorageHash(WEBAPP_STORAGE_KEY);
}

WebApp.set_install_id = function (id){
	localStorage[INSTALL_KEY] = id;
}

WebApp.install_id = function(){
	return localStorage[INSTALL_KEY]
}

WebApp.last_updated = ko.observable(null);

WebApp.sync = function(data, callback){
	if(navigator.onLine){
		$.ajax({type: 'POST', url:'/webapp/sync', data: data})
			.success(function(data){

				// update researcher data
				ResearcherModel.set_local_storage_values(data['researchers']);
				ResearcherModel.loadFromLocalJson();
				
				// run the callback with the data
				callback(data);

			}).error(function(data){ // run if success or error
				ResearcherModel.loadFromLocalJson();			
				callback(); // run the callback without the data
			});
	}else{
		ResearcherModel.loadFromLocalJson();			
		callback(); // run the callback without the data
	}
}