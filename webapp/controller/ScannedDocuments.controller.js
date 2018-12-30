sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices"
], function (BaseController, MessageBox, documentServices) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.ScannedDocuments", {
		
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("scannedTable");
			tbl.setBusy(true);
			documentServices.getInstance().getSuccesfullyScannedDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});