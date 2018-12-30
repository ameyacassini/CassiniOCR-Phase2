sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	'../Formatter'
], function (BaseController, MessageBox, documentServices, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.ValidationErrors", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
		},
		onSelectDocument: function(oEvent) {
			try {
				var docId = oEvent.getSource().data("uniqueId");
				var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
				oRouter.navTo("ValidationErrorDetails", {
					docId: docId
				});
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("validationErrorTable");
			tbl.setBusy(true);
			documentServices.getInstance().getValidationErrorDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});