sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("demo.cassini.ocr.CassiniOCR.controller.App", {
		onChangeLanguage: function(oEvent) {
			try {
				console.log(oEvent);
				if(oEvent.getParameter("state")) {
					/*var i18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl : "i18n/messageBundle.properties",
						bundleLocale : "dt"
					});*/
					sap.ui.getCore().getConfiguration().setLanguage("en");
				} else {
					sap.ui.getCore().getConfiguration().setLanguage("de");
				}
			} catch (ex) {
				console.log(ex);
			}
		}
	});
});