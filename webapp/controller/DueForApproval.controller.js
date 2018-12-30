sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	'../Formatter'
], function (BaseController, MessageBox, documentServices, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.DueForApproval", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
		},
		onSelectDocument: function(oEvent) {
			try {
				var approvalId = oEvent.getSource().data("uniqueId");
				this.getRouter().navTo("PoPreference", {
					approvalId: approvalId
				});
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("awaitingApprovalTable");
			tbl.setBusy(true);
			documentServices.getInstance().getAwaitingApprovalDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});