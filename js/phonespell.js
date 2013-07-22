
function addPhoneItem(displayName,phoneNumber) {
	var item = $(".item-template").clone();
	item.appendTo(".items").removeClass("item-template").addClass("item"); 
	item.find("[data-role='none']").removeAttr("data-role");
	item.find("#item-title").text(displayName);
	item.find("#item-count").text(phoneNumber);
	item.find("a").jqmData("phoneNumber",phoneNumber);
	item.find("a").bind("vclick",function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var phoneNumber = $(this).jqmData("phoneNumber");
		var myPhoneSpellForm = $("#myPhoneSpellForm");
		var phoneInput = $("#phone", myPhoneSpellForm);
		phoneInput.val(phoneNumber);
		$.mobile.changePage("#myPhoneSpell");
		return false;
	});
	return item;
}

var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

$.when(deviceReadyDeferred, jqmReadyDeferred).then(function() {
	debugWrite('when(deviceReadyDeferred, jqmReadyDeferred).then','start');
	var contactFields = ["displayName", "phoneNumbers"];
	var contactSuccess = function (contacts) {
		for (var i=0; i<contacts.length; i++) {
			debugWrite("contacts",contacts[i]);
			if (contacts[i].phoneNumbers){
				for(var j=0; j<contacts[i].phoneNumbers.length; j++) {
					var item = addPhoneItem(contacts[i].displayName,contacts[i].phoneNumbers[j].value);
				}
			}
		}
		$("#phoneChoose .items.ui-listview").listview("refresh");		
	}
	var contactError = function(error) {
		// Handle the error
		debugWrite('contactError',error);
		navigator.notification.alert(contactErrorMessage(error)+'(Error code: ' + error.code +')', null, 'Contact Error');
		return false;
	}
	var contactFindOptions = {
		filter: "",
		multiple: true
	};
	navigator.contacts.find(contactFields, contactSuccess, contactError, contactFindOptions);
	debugWrite('when(deviceReadyDeferred, jqmReadyDeferred).then','end');
});

$(document).one("pagebeforechange",function(event) {
	debugWrite("pagebeforechange","one");
	jqmReadyDeferred.resolve();
});
	
$(document).on("pageinit","#myPhoneSpell",function(event) {
	var myPhoneSpellForm = $("#myPhoneSpellForm");
	
    myPhoneSpellForm.validate();
	
	myPhoneSpellForm.submit(function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
        if ($(this).valid()) {
			var myPhoneSpellResult = $("#myPhoneSpellResult");
			$(this).ajaxSubmit({
				target:myPhoneSpellResult
			});
		}
		return false;
    });	
});

$(document).on("vclick","a[target='_blank']",function(event) {
	if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
	openExternalURL($(this).attr("href"));
	return false;
});

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("backbutton", handleBackButton, false);

// Cordova is ready
//
function onDeviceReady() {
	debugWrite("onDeviceReady","start");
	deviceReadyDeferred.resolve();
	debugWrite("onDeviceReady","end");
}

function handleBackButton() {
  	debugWrite("Back Button Pressed!","start");
    navigator.app.exitApp();
  	debugWrite("Back Button Pressed!","end");
}
