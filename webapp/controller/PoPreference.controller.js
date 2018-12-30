sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/PDFViewer",
	"cassini/sim/service/documentServices",
	"../Formatter"
], function (BaseController, JSONModel, MessageBox, PDFViewer, documentServices, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.ScanningErrors", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("PoPreference").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function(oEvent) {
			var mgrApprovalDataModel = oComponent.getModel("awaitingApprovalDocuments");
			var approvals = mgrApprovalDataModel.getData();
			var approval = {};
			for(var i = 0; i < approvals.length; i++) {
				if(approvals[i].uniqueId === oEvent.getParameter("arguments").approvalId){
					approval = approvals[i];
					break;
				}
			}
			
			
			
			approval.balanceAmount = approval.grossValue;
			approval.isValid = false;
			
			var approvalModel = new sap.ui.model.json.JSONModel(approval);
			oView.setModel(approvalModel, "approval"); 
			
			var filePath = approval.filePath;
			var newFilePath = filePath.substring(filePath.lastIndexOf("/") + 1);
			var postData = JSON.stringify({
				filePath: newFilePath,
				linkId: approval.documentId
			});
			
			documentServices.getInstance().getFile(this, postData, 
				function(oData) {
					//oView.byId("invoiceFileImg").setBusy(false);
				},
				function(oError) {
					if(oError.status === 200) {
						approvalModel.getData().file = oError.responseText;
						approvalModel.refresh(true);
					}
				});
			
			$.ajax("/ocrspring/ocr/"+ approval.documentId + "/", {
				success: function(data) {
					var lineItemsModel = new JSONModel();
					lineItemsModel.setData(data);
					oComponent.setModel(lineItemsModel, "lineItems");
				},
				error: function(err) {
					MessageBox.error(err);
		    	}
		   });
		},
		onViewDocument: function (oEvent) {
			var sSource = oEvent.getSource().data("file");
			//this._pdfViewer.setSource(sSource);
			//this._pdfViewer.setTitle("Document");
			//this._pdfViewer.open();
			//var batchId = oEvent.getSource().data("batchId");
			//var url = "http://103.73.151.249/DataVerifier?batchId=" + batchId;
			
			//window.open(sSource, "myWindow", "width=1000, height=800");
			var pdfWindow = window.open("", "myWindow", "width=1000, height=800");
			pdfWindow.document.write("<iframe width='100%' height='100%' src='" + sSource +"'></iframe>");
			//window.open(sSource, '_blank');
		},
		onSelectionPO: function(oEvent) {
			try {
				var table = oEvent.getSource();
				var sPath = oEvent.getParameter("rowContext").getPath();
				var selectedRecord = oEvent.getParameter("rowContext").getModel().getProperty(sPath);
				oController._updateBalanceAmount(table, selectedRecord);
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onChangePoQuantity: function(oEvent) {
			try {
				var row = oEvent.getSource().getParent();
				var sPath = row.getBindingContext('approval').getPath();
				var selectedRecord = row.getBindingContext('approval').getModel().getProperty(sPath);
				
				var table = oView.byId("poItemsTbl");
				var rowBinding = table.getBindingInfo("rows");
				var selectedIndices = table.getSelectedIndices();

				var isSelected = false;
				for(var i = 0; i < selectedIndices.length; i++) { 
					if(sPath === rowBinding.path + "/" + selectedIndices[i]) {
						isSelected = true;
						break;
					}
				}
				if(isSelected) {
					oController._updateBalanceAmount(table, selectedRecord);
				}
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		_updateBalanceAmount: function(table, selectedRecord) {
			try {
				var displayQty = parseFloat(selectedRecord.qtyToDisplay);
				var qty = parseFloat(selectedRecord.poItemQuantity);
				if(qty > displayQty) {
					MessageBox.error("Item quantity should be less than or equal to the open PO quantity");
				} else {
					var rowBinding = table.getBindingInfo("rows");
					var selectedIndices = table.getSelectedIndices();
					
					var approval = oView.getModel("approval");
					var tax = parseFloat(approval.getData().tax);
					var totalDiff = 0;
					approval.getData().selectedPoItems = [];
					for(var i = 0; i < selectedIndices.length; i++) {
						var item = rowBinding.binding.getModel().getProperty(rowBinding.path + "/" + selectedIndices[i]);
						totalDiff += (parseFloat(item.poItemQuantity) * parseFloat(item.netPrice));
						approval.getData().selectedPoItems.push(item);
					}
					
					var balanceAmount = parseFloat(approval.getData().grossValue) - (totalDiff + tax);
					if(balanceAmount == 0) {
						approval.getData().isValid = true;
					} else {
						approval.getData().isValid = false;
					}
					approval.getData().balanceAmount = balanceAmount;
					approval.refresh(true);
				}
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		
		/** 
		 * 
		 * @param {Date} date
		 * @returns
		 */
		getResponseDate: function(date) {
			var month = date.getMonth();
			if(month < 9)
				month = "0" + (date.getMonth() + 1);
			
			return date.getFullYear() + "-" + month + "-" + date.getDate() + "T00:00:00";
		},
		
		onApprove: function(oEvent) {
			try {
				MessageBox.confirm(
					"Do you approve the invoice posting?",
					{
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function(sAction) {
							if(sAction == "OK") { 
								sap.ui.core.BusyIndicator.show(0);
								
								var postData = oView.getModel("approval").getData().getSAPPostData(false);
								
								var mainServiceModel = oComponent.getModel("mainServiceModel");
								mainServiceModel.create("/UpdOcrHdrs", postData, {
									success: function(oData) {
										sap.ui.core.BusyIndicator.hide();
										MessageBox.success(
											"The document is approved for posting",
											{
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(sAction) {
													documentServices.getInstance().getAwaitingApprovalDocuments(oController);
													documentServices.getInstance().getApprovedDocuments(oController);
													oController.getRouter().navTo("Dashboard");
												}
											}
										);
									},
									error: function(oError) {
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error(oError);
									}
								});				
							} else {
								sap.ui.core.BusyIndicator.hide();
							}
						}
					});
			} catch (ex) {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(ex);
			}
		}
	});
});