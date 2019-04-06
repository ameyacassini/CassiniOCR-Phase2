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
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.PoPreference", {
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
			sap.ui.core.BusyIndicator.show(0);
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
				},
				function(oError) {
					if(oError.status === 200) {
						approvalModel.getData().file = oError.responseText;
						approvalModel.refresh(true);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			
			$.ajax("/ocrspring/ocr/"+ approval.documentId + "/", {
				success: function(data) {
					var lineItemsModel = new JSONModel();
					var aLineItems = [];
					if(data && data.length > 0) {
						for(var j = 0; j < data.length; j++) {
							var oLineItem = new LineItem(data[j]);
							aLineItems.push(oLineItem);
						}
						
					}
					lineItemsModel.setData(aLineItems);
					oComponent.setModel(lineItemsModel, "lineItems");
					oController._updatePOWithLineItem();
				},
				error: function(err) {
					MessageBox.error(err);
		    	}
		   });
		},
		
		_updatePOWithLineItem: function() {
			var aLineItems = oComponent.getModel("lineItems").getData();
			var oApprovalModel = this.getView().getModel("approval");
			oApprovalModel.setProperty("/isValid", true);
			var aPOItems =  oApprovalModel.getProperty("/poItems");
			for(var i = 0; i < aPOItems.length; i++) {
				if(aPOItems[i].vendorMaterialDesc && aPOItems[i].vendorMaterialDesc !== "") {
					var oLineItem = aLineItems.find(function(item) {
						return item.description && aPOItems[i].vendorMaterialDesc.toUpperCase().trim() === item.description.toUpperCase().trim();
					});
					if(oLineItem) {
						aPOItems[i].poItemQuantity = parseFloat(oLineItem.quantity);
						aPOItems[i].lineItemPrice = parseFloat(oLineItem.unitPrice);
						aPOItems[i].lineItemQty = parseFloat(oLineItem.quantity);
						var bHighlightError = false;
						if(oController._validatePriceTolerance(aPOItems[i])) {
							//aPOItems[i].status = "Success";
							aPOItems[i].priceValueState = "None";
							aPOItems[i].priceValueStateText = "";
						} else {
							bHighlightError = true;
							//aPOItems[i].status = "Error";
							aPOItems[i].priceValueState = "Error";
							oApprovalModel.setProperty("/isValid", false);
							aPOItems[i].priceValueStateText = "Price is out of allowed tolerance limit";
						}
						
						if(!aPOItems[i].webre && oController._validateQtyTolerance(aPOItems[i])) {
							//aPOItems[i].status = "Success";
							aPOItems[i].qtyValueState = "None";
							aPOItems[i].qtyValueStateText = "";
						} else {
							//aPOItems[i].status = "Error";
							aPOItems[i].qtyValueState = "Error";
							oApprovalModel.setProperty("/isValid", false);
							aPOItems[i].qtyValueStateText = "Quantity is out of allowed tolerance limit";
						}
						
						if(bHighlightError) {
							aPOItems[i].status = "Error";
						} else {
							aPOItems[i].status = "Success";
						}
					} else {
						aPOItems[i].status = "None";
						aPOItems[i].priceValueState = "None";
						aPOItems[i].priceValueStateText = "";
						aPOItems[i].qtyValueState = "None";
						aPOItems[i].qtyValueStateText = "";
					}
				}
			}
			oController._updateBalanceAmount();
			oApprovalModel.refresh(true);
		},
		
		_validatePriceTolerance: function(oPOItem) {
			var percentPriceLowLimit = parseFloat(oPOItem.priceLowLimit);
			var percentPriceUpLimit = parseFloat(oPOItem.priceUpLimit);
			
			var fNetPrice = parseFloat(oPOItem.netPrice);
			
			var priceLowLimit = fNetPrice - ((fNetPrice * percentPriceLowLimit) / 100);
			var priceUpLimit = fNetPrice + ((fNetPrice * percentPriceUpLimit) / 100);
			
			var fLineItemPrice = parseFloat(oPOItem.lineItemPrice);
			
			if( fLineItemPrice < priceLowLimit || fLineItemPrice >  priceUpLimit) {
				return false;
			}
			return true;
		},
		
		_validateQtyTolerance: function(oPOItem) {
			//var percentQtyLowLimit = parseFloat(oPOItem.qtyLowLimit);
			var percentQtyUpLimit = parseFloat(oPOItem.qtyUpLimit);
			
			var fQtyToDisplay = parseFloat(oPOItem.qtyToDisplay);
			
			//var qtyLowLimit = fQtyToDisplay - ((fQtyToDisplay * percentQtyLowLimit) / 100);
			var qtyUpLimit = fQtyToDisplay + ((fQtyToDisplay * percentQtyUpLimit) / 100);
			
			var fLineItemQty = parseFloat(oPOItem.lineItemQty);
			
			if( fLineItemQty > qtyUpLimit) {
				return false;
			}
			return true;
		},
		
		onSelectVendorMaterial: function (oEvent) {
			var oSource = oEvent.getSource();
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			var oSelectedPoItemBinding = oSource.getCustomData()[0].getBindingContext("approval");
			/*var oPoItemModel = oSelectedPoItemBinding.getModel();*/
			var oApprovalModel = this.getView().getModel("approval");
			var aPOItems = oApprovalModel.getProperty("/poItems");
			var sPoItemPath = oSelectedPoItemBinding.getPath();
			var oSelectedPoItem = oApprovalModel.getProperty(sPoItemPath);
			var isValid = true;
			var mappedId = -1;
			for(var i = 0; i < aPOItems.length; i++) {
				if(aPOItems[i].id !== oSelectedPoItem.id && aPOItems[i].vendorMaterialDesc && aPOItems[i].vendorMaterialDesc.toUpperCase().trim() === sSelectedKey.toUpperCase().trim()) {
					isValid = false;
					mappedId = aPOItems[i].id;
					break;
				}
			}
			
			if(!isValid) {
				//oSelectedPoItem.setValueState("mappingValueState", sap.ui.core.ValueState.Error);
				oSource.setValueState(sap.ui.core.ValueState.Error);
				oSource.setValueStateText("Vendor Material is already mapped in Sr. No. " + mappedId);
				// oSelectedPoItem.mappingValueStateText = "";
				oSelectedPoItem.vendorMaterialDesc = "";
				oSelectedPoItem.poItemQuantity = 0;
				MessageToast.show("Vendor Material is already mapped in Sr. No. " + mappedId);
				oSource.setSelectedKey("");
			} else {
				oSource.setValueState(sap.ui.core.ValueState.None);
				//oSelectedPoItem.setValueState("mappingValueState", sap.ui.core.ValueState.None);
				// oSelectedPoItem.mappingValueStateText = "";
				var oModel = this.getOwnerComponent().getModel("lineItems");
				
				var oSelectedLineItem = oModel.getData().find(function(item) {
					return item.description.toUpperCase() === sSelectedKey.toUpperCase();
				});
				oSelectedPoItem.poItemQuantity = parseFloat(oSelectedLineItem.quantity);
				oSource.setValueStateText("");
				oSelectedPoItem.vendorMaterialDesc = sSelectedKey;	
			}
			this._updatePOWithLineItem();
			//this._updateBalanceAmount();
			/*if(oSelectedLineItem) {
				oSelectedLineItem.isMapped = true;
			}
			
			
			
			
			if(oSelectedPoItem && oSelectedPoItem.vendorMaterialDesc) {
				var oLineItem = oModel.getData().find(function(item) {
					return item.description.toUpperCase() === oSelectedPoItem.vendorMaterialDesc.toUpperCase();
				});
				if(oLineItem) {
					oLineItem.isMapped = true;
				}
			}
			if(oSelectedPoItem && sSelectedKey) {
				oSource.setValue(sSelectedKey.toString());
				oSelectedPoItem.vendorMaterialDesc = sSelectedKey;
			}*/
			
			oApprovalModel.refresh(true);
			//oModel.refresh(true);
			//var sPath = oBinding.getPath();
			//var sSelectedLineItem = oModel.getProperty(sPath);
			
			
		}, 
		_updateBalanceAmount: function() {
			try {
				var oApprovalModel = this.getView().getModel("approval");
				var aPOItems =  oApprovalModel.getProperty("/poItems");
				var tax = parseFloat(oApprovalModel.getProperty("/tax"));
				var totalDiff = 0;
				var aSelectedPOItems = oApprovalModel.getProperty("/selectedPoItems");
				aSelectedPOItems = [];
				//oApprovalModel.setProperty("/selectedPoItems", []);
				for(var i = 0; i < aPOItems.length; i++) {
					totalDiff = totalDiff + (parseFloat(aPOItems[i].poItemQuantity) * parseFloat(aPOItems[i].lineItemPrice));
					aSelectedPOItems.push(aPOItems[i]);
				}
				var balanceAmount = parseFloat(oApprovalModel.getProperty("/grossValue")) - (totalDiff + tax);
				if(balanceAmount !== 0) {
					oApprovalModel.setProperty("/isValid", false);
				}
				oApprovalModel.setProperty("/balanceAmount", balanceAmount);
				oApprovalModel.setProperty("/selectedPoItems", aSelectedPOItems);
				oApprovalModel.refresh(true);
				
				
				/*var displayQty = parseFloat(selectedRecord.qtyToDisplay);
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
				}*/
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		onViewDocument: function (oEvent) {
			var sSource = oEvent.getSource().data("file");
			var pdfWindow = window.open("", "myWindow", "width=1000, height=800");
			pdfWindow.document.write("<iframe width='100%' height='100%' src='" + sSource +"'></iframe>");
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
		/*_updateBalanceAmount: function(table, selectedRecord) {
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
		},*/
		
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