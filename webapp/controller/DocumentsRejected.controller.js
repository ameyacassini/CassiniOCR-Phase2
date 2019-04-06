sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	"../Formatter"
], function (BaseController, MessageBox, documentServices, Formatter) {
	"use strict";
	var oView;
	return BaseController.extend("cassini.sim.controller.DocumentsRejected", {
		onInit: function() {
			oView = this.getView();
		},
		onSelectDocument: function(oEvent) {
			try {
				var rejectionId = oEvent.getSource().data("uniqueId");
				this.getRouter().navTo("DocumentsRejectedDetails", {
					rejectionId: rejectionId
				});
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("rejectedDocumentsTable");
			tbl.setBusy(true);
			documentServices.getInstance().getRejectedDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});