sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/PDFViewer",
	"cassini/sim/service/documentServices",
	"cassini/sim/model/LineItem",
	"sap/m/MessageToast",
	"../Formatter"
], function (BaseController, JSONModel, MessageBox, PDFViewer, documentServices, LineItem, MessageToast, Formatter) {
	"use strict";
	var oView, oComponent;
	return BaseController.extend("cassini.sim.controller.DocumentsRejectedDetails", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("DocumentsRejectedDetails").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var mgrRejectionDataModel = oComponent.getModel("rejectedDocuments");
			var rejections = mgrRejectionDataModel.getData();
			var rejection = {};
			for(var i = 0; i < rejections.length; i++) {
				if(rejections[i].uniqueId === oEvent.getParameter("arguments").rejectionId){
					rejection = rejections[i];
					break;
				}
			}
			var rejectionModel = new sap.ui.model.json.JSONModel(rejection);
			oView.setModel(rejectionModel, "rejection"); 
			
			var filePath = rejection.filePath;
			var newFilePath = filePath.substring(filePath.lastIndexOf("/") + 1);
			var postData = JSON.stringify({
				filePath: newFilePath,
				linkId: rejection.documentId
			});
			
			documentServices.getInstance().getFile(this, postData, 
				function(oData) {
				},
				function(oError) {
					if(oError.status === 200) {
						rejectionModel.getData().file = oError.responseText;
						rejectionModel.refresh(true);
						sap.ui.core.BusyIndicator.hide();
					}
				});
		},
		onViewDocument: function (oEvent) {
			var sSource = oEvent.getSource().data("file");
			var pdfWindow = window.open("", "myWindow", "width=1000, height=800");
			pdfWindow.document.write("<iframe width='100%' height='100%' src='" + sSource + "'></iframe>");
		}
	});
});