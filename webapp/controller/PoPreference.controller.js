sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"../Formatter"
], function (Controller, MessageBox, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return Controller.extend("demo.cassini.ocr.CassiniOCR.controller.ScanningErrors", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("PoPreference").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function(oEvent) {
			var mgrApprovalDataModel = oComponent.getModel("MgrApprovalData");
			var approvals = mgrApprovalDataModel.getData();
			var approval = {};
			for(var i = 0; i < approvals.length; i++) {
				if(approvals[i].Uniqueid == oEvent.getParameter("arguments").approvalId){
					approval = approvals[i];
					break;
				}
			}
			approval.balanceAmount = approval.Grossvalue;
			approval.isValid = false;
			
			var approvalModel = new sap.ui.model.json.JSONModel(approval);
			oView.setModel(approvalModel, "approval");  
		},
		onSelectionPO: function(oEvent) {
			try {
				var table = oEvent.getSource();
				var sPath = oEvent.getParameter("rowContext").getPath();
				var selectedRecord = oEvent.getParameter("rowContext").getModel().getProperty(sPath);
				oController._updateBalanceAmount(table, selectedRecord);
				/*var approval = oView.getModel("approval");
				
				var tax = parseFloat(approval.getData().Vat)
				
				var rowBinding = table.getBindingInfo("rows");
				var selectedIndices = table.getSelectedIndices();
				var totalDiff = 0;
				for(var i = 0; i < selectedIndices.length; i++) {
					var item = rowBinding.binding.getModel().getProperty(rowBinding.path + "/" + selectedIndices[i]);
					totalDiff += (parseFloat(item.PoitemQuantity) * parseFloat(item.Netprice)) + tax;
				}
				
				var balanceAmount = parseFloat(approval.getData().Grossvalue) - totalDiff;
				if(balanceAmount == 0) {
					approval.getData().isValid = true;
				} else {
					approval.getData().isValid = false;
				}
				approval.getData().balanceAmount = balanceAmount;
				approval.refresh(true);
				
				console.log(oEvent);*/
				
			} catch (ex) {
				console.log(ex);
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
					/*var displayQty = parseFloat(selectedRecord.QtyToDisplay);
					var qty = parseFloat(selectedRecord.PoitemQuantity);
					if(qty > displayQty) {
						MessageBox.error("PO Item Quantity should not be greater than Open PO Quantity");
					} else {*/
						oController._updateBalanceAmount(table, selectedRecord);
					//}
					
					
					/*var approval = oView.getModel("approval");
					var tax = parseFloat(approval.getData().Vat)
					var totalDiff = 0;
					for(var i = 0; i < selectedIndices.length; i++) {
						var item = rowBinding.binding.getModel().getProperty(rowBinding.path + "/" + selectedIndices[i]);
						totalDiff += (parseFloat(item.PoitemQuantity) * parseFloat(item.Netprice)) + tax;
					}
					
					var balanceAmount = parseFloat(approval.getData().Grossvalue) - totalDiff;
					if(balanceAmount == 0) {
						approval.getData().isValid = true;
					} else {
						approval.getData().isValid = false;
					}
					approval.getData().balanceAmount = balanceAmount;
					approval.refresh(true);	*/
				}
				console.log(oEvent);
			} catch (ex) {
				console.log(ex);
			}
		},
		_updateBalanceAmount: function(table, selectedRecord) {
			try {
				var displayQty = parseFloat(selectedRecord.QtyToDisplay);
				var qty = parseFloat(selectedRecord.PoitemQuantity);
				if(qty > displayQty) {
					MessageBox.error("Item quantity should be less than or equal to the open PO quantity");
				} else {
					var rowBinding = table.getBindingInfo("rows");
					var selectedIndices = table.getSelectedIndices();
					
					var approval = oView.getModel("approval");
					var tax = parseFloat(approval.getData().Vat);
					var totalDiff = 0;
					approval.getData().UpdOcrHdrToOcrItm = {
						results: []
					};
					for(var i = 0; i < selectedIndices.length; i++) {
						var item = rowBinding.binding.getModel().getProperty(rowBinding.path + "/" + selectedIndices[i]);
						totalDiff += (parseFloat(item.PoitemQuantity) * parseFloat(item.Netprice));
						approval.getData().UpdOcrHdrToOcrItm.results.push(item);
					}
					
					var balanceAmount = parseFloat(approval.getData().Grossvalue) - (totalDiff + tax);
					if(balanceAmount == 0) {
						approval.getData().isValid = true;
					} else {
						approval.getData().isValid = false;
					}
					approval.getData().balanceAmount = balanceAmount;
					approval.refresh(true);
				}
			} catch (ex) {
				console.log(ex);
			}
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
								var approvalData = JSON.parse(JSON.stringify(oView.getModel("approval").getData()));
								for(var i = 0; i < approvalData.UpdOcrHdrToOcrItm.results.length; i++) {
									approvalData.UpdOcrHdrToOcrItm.results[i].Message = "";
									approvalData.UpdOcrHdrToOcrItm.results[i].MgrApproved = "X";
									delete approvalData.UpdOcrHdrToOcrItm.results[i].QtyToDisplay;
									delete approvalData.UpdOcrHdrToOcrItm.results[i].__metadata;
								}
								
								var postData = {
									Servicecall: "MGR",
									PostingDate: new Date(approvalData.Invoicedate),
									MgrComment: approvalData.MgrComment,
									Vat: approvalData.Vat,
									TaxCode: "",
									DocumentDate: new Date(),
									CalcTax: "",
									UpdOcrHdrToOcrItm: approvalData.UpdOcrHdrToOcrItm
								};
								var mainServiceModel = oComponent.getModel("mainServiceModel");
								mainServiceModel.create("/UpdOcrHdrs", postData, {
									success: function() {
										sap.ui.core.BusyIndicator.hide();
										MessageBox.success(
											"Request approved",
											{
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(sAction) {
													var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
													oRouter.navTo("Home");
												}
											}
										);
									},
									error: function() {
										sap.ui.core.BusyIndicator.hide();
										console.log(oError);
									}
								});				
							} else {
								sap.ui.core.BusyIndicator.hide();
							}
						}
					});
			} catch (ex) {
				sap.ui.core.BusyIndicator.hide();
				console.log(ex);
			}
		}
	});
});