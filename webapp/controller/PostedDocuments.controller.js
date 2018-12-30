sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	'../Formatter'
], function (BaseController, MessageBox, documentServices, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.PostedDocuments", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("postedTable");
			tbl.setBusy(true);
			documentServices.getInstance().getPostedDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});