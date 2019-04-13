sap.ui.define([
	"sap/ui/base/Object",
	"cassini/sim/model/Application"
], function (Object, Application) {
	"use strict";
	var instance;
	var utilities = Object.extend("cassini.sim.service.utilities", {
		constructor: function () {},
		read: function (mParameters) {
			var oModel = mParameters.oController.getOwnerComponent().getModel(mParameters.sModelName);
			oModel.read("/" + mParameters.sEntity, {
				filters: (mParameters.filters) ? mParameters.filters : [],
				urlParameters: {
					"$expand": (mParameters.expand) ? mParameters.expand : ""
				},
				success: function(oData) {
					mParameters.fnSuccess(oData);
					instance.loadingCompleted(mParameters.oController);
				},
				error: function(oError) {
					//fnError(oError);
					instance.error(oError);
				}
			});
		},
		create: function (mParameters) {
			var oModel = mParameters.oController.getOwnerComponent().getModel(mParameters.sModelName);
			oModel.create("/" + mParameters.sEntity, mParameters.oPostData, {
				success: function(oData) {
					mParameters.fnSuccess(oData);
					//instance.loadingCompleted(mParameters.oController);
				},
				error: function(oError) {
					if(mParameters.fnError)
						mParameters.fnError(oError);
					//fnError(oError);
					instance.error(oError);
				}
			});
		},
		getHttp: function(mParameters) {
			$.ajax(mParameters.sUrl, {
				success: function(oData) {
					mParameters.fnSuccess(oData);
					instance.loadingCompleted(mParameters.oController);
				},
				error: function(oError) {
					//fnError(err);
					instance.error(oError);
				}
			});
		},
		postHttp: function(mParameters) {
			$.ajax({
				type: 'POST',
				headers: { 
			        'Content-Type': 'application/json' 
			    },
				url: mParameters.sUrl,
				data: mParameters.oPostData,
				dataType: "json",
				success: function(oData) {
					mParameters.fnSuccess(oData);
				},
				error: function(oError) {
					instance.error(oError);
					mParameters.fnError(oError);
				}
			});
		},
		error: function(oError) {
			jQuery.sap.log.error(oError);
		},
		loadingCompleted: function(oController) {
			var successfullyScannedDocuments = oController.getOwnerComponent().getModel("successfullyScannedDocuments");
			var manualVerifyDocuments = oController.getOwnerComponent().getModel("manualVerifyDocuments");
			var validationErrorsDocuments = oController.getOwnerComponent().getModel("validationErrorsDocuments");
			var awaitingApprovalDocuments = oController.getOwnerComponent().getModel("awaitingApprovalDocuments");
			var rejectedDocuments = oController.getOwnerComponent().getModel("rejectedDocuments");
			var approvedDocuments = oController.getOwnerComponent().getModel("approvedDocuments");
			var postedDocuments = oController.getOwnerComponent().getModel("postedDocuments");
			if(successfullyScannedDocuments && manualVerifyDocuments && validationErrorsDocuments && awaitingApprovalDocuments && rejectedDocuments && approvedDocuments && postedDocuments) {
				var oComponent = Application.getInstance().getComponent();
				jQuery("#busyLoader").fadeOut();
				oComponent.getRouter().initialize();
			}
		}
	});
	return {
		getInstance: function () {
			if (!instance) {
				instance = new utilities();
			}
			return instance;
		}
	};
});