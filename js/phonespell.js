///////////////////////////////////////////////
//
// PhoneSpell application
//
// Copyright (c) RBA DESIGN INTERNATIONAL LLC
// http://rbadesign.us
//
// Developer: Dmitry Protopopov
// protopopov@narod.ru
//
///////////////////////////////////////////////

(function ($) {

	$.phonespell = $.phonespell || {};
	$.phonespell.i18n = $.phonespell.i18n || {};
	
	var currentLanguage = "en";
	
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
	var domReadyDeferred = $.Deferred();
	var languageReadyDeferred = $.Deferred();
	
	$.when(deviceReadyDeferred, domReadyDeferred).then(function() {
		debugWrite('when(deviceReadyDeferred, domReadyDeferred).then','start');
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
		debugWrite('when(deviceReadyDeferred, domReadyDeferred).then','end');
	});
		
	$.when(domReadyDeferred, languageReadyDeferred).then(function() {
		debugWrite('when(domReadyDeferred, languageReadyDeferred).then','start');
		debugWrite("currentLanguage",currentLanguage);
		debugWrite("$.phonespell.i18n[currentLanguage]",$.phonespell.i18n[currentLanguage]);
		var page = $("#myPhoneSpell");
		var header = $("div[data-role='header']",page);
		var form = $("#myPhoneSpellForm",page);
		var headerTitle=$("h2",header);
		var phoneLabel=$("label[for='phone']",form);
		var languageLabel=$("label[for='language']",form);
		var submitButton=$("input[type='submit']",form);
		headerTitle.text($.phonespell.i18n[currentLanguage].headerTitle||headerTitle.text());
		phoneLabel.text($.phonespell.i18n[currentLanguage].phoneLabel||phoneLabel.text());
		languageLabel.text($.phonespell.i18n[currentLanguage].languageLabel||languageLabel.text());
		submitButton.val($.phonespell.i18n[currentLanguage].submitButton||submitButton.val());
		$.mobile.initializePage();
		debugWrite('when(domReadyDeferred, languageReadyDeferred).then','end');
	});
	
	$(document).ready(function(event) {
		debugWrite("document","ready");
		domReadyDeferred.resolve();
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
	
	// Cordova is ready
	//
	function onDeviceReady() {
		debugWrite("onDeviceReady","start");
		
		deviceReadyDeferred.resolve();
		
		try {
			navigator.globalization.getLocaleName(
				function(locale) { 
					if($.phonespell.i18n[locale.value.substr(0,2)]) currentLanguage = locale.value.substr(0,2); 
					languageReadyDeferred.resolve();
				},
				function() {
					languageReadyDeferred.resolve();
				}
			)
		} catch(e) {
			languageReadyDeferred.resolve();
		}
		
		document.addEventListener("backbutton", handleBackButton, false);
		
		debugWrite("onDeviceReady","end");
	}
	
	function handleBackButton() {
		debugWrite("Back Button Pressed!","start");
		navigator.app.exitApp();
		debugWrite("Back Button Pressed!","end");
	}
	
})(jQuery);
