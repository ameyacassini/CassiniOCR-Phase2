sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	'../Formatter'
], function (BaseController, MessageBox, documentServices, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.ScanningErrors", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			
			var oModel = this.getOwnerComponent().getModel();
			var postData = oModel.getData().PostData;
			var scanningErrorData = postData.filter(function(data) {
			    return data.status === 0;
			});
			
			var oScanningErrorModel = new sap.ui.model.json.JSONModel({
				PostData: scanningErrorData
			});
			this.getOwnerComponent().setModel(oScanningErrorModel, "ScanningErrorData");
		},
		onSelectDocument: function(oEvent) {
			try {
				
				//var row = oEvent.getSource().getParent();
				//var sPath = row.getBindingContext('NonSapErrorData').getPath();
				//var selectedRecord = row.getBindingContext('NonSapErrorData').getModel().getProperty(row.getBindingContext('NonSapErrorData').getPath());
				
				
				var scanId = oEvent.getSource().getProperty('text');
				var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
				oRouter.navTo("ScanningErrorDetails", {
					scanId: scanId
				});
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onNavigateManualVerify: function (oEvent) {
			var batchId = oEvent.getSource().data("batchId");
			var url = "http://103.73.151.249/DataVerifier?batchId=" + batchId;
			window.open(url, '_blank');
		},
		onRefresh: function (oEvent) {
			var tbl = oView.byId("manualVerifyTable");
			tbl.setBusy(true);
			documentServices.getInstance().getManualVerificationDocuments(this, function() {
				tbl.setBusy(false);
			});
		}
	});
});