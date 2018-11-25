sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'../Formatter'
], function (Controller, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return Controller.extend("demo.cassini.ocr.CassiniOCR.controller.DueForApproval", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
		},
		onSelectDocument: function(oEvent) {
			try {
				var row = oEvent.getSource().getParent();
				var sPath = row.getBindingContext('MgrApprovalData').getPath();
				var selectedRecord = row.getBindingContext('MgrApprovalData').getModel().getProperty(row.getBindingContext('MgrApprovalData').getPath());
				
				
				var approvalId = oEvent.getSource().getProperty('text');
				var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
				oRouter.navTo("PoPreference", {
					approvalId: approvalId
				});
			} catch (ex) {
				console.log(ex);
			}
		}
	});
});