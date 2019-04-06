sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices"
], function (BaseController, MessageBox, documentServices) {
	"use strict";

	return BaseController.extend("cassini.sim.controller.App", {
		
		onInit: function() {
			documentServices.getInstance().getSuccesfullyScannedDocuments(this);
			documentServices.getInstance().getManualVerificationDocuments(this);
			documentServices.getInstance().getValidationErrorDocuments(this);
			documentServices.getInstance().getAwaitingApprovalDocuments(this);
			documentServices.getInstance().getApprovedDocuments(this);
			documentServices.getInstance().getPostedDocuments(this);
			documentServices.getInstance().getRejectedDocuments(this);
		},
		
		calculateSuccessRate: function() {
			
		},
		
		onChangeLanguage: function(oEvent) {
			try {
				if(oEvent.getParameter("state")) {
					sap.ui.getCore().getConfiguration().setLanguage("en");
				} else {
					sap.ui.getCore().getConfiguration().setLanguage("de");
				}
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		
		goHome: function(oEvent) {
			this.getRouter().navTo("Dashboard");
		}
	});
});