sap.ui.define([
	"cassini/sim/controller/BaseController",
	"sap/m/MessageBox",
	"cassini/sim/service/documentServices",
	"sap/m/PDFViewer",
	'../Formatter'
], function (BaseController, MessageBox, documentServices, PDFViewer, Formatter) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.ValidationErrorDetails", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("ValidationErrorDetails").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function(oEvent) {
			var sapErrorDataModel = oComponent.getModel("validationErrorsDocuments");
			var errors = sapErrorDataModel.getData();
			var errorData = {};
			for(var i = 0; i < errors.length; i++) {
				if(errors[i].uniqueId === oEvent.getParameter("arguments").docId){
					errorData = errors[i];
					break;
				}
			}
			errorData.fileName = "";
			var errorModel = new sap.ui.model.json.JSONModel(errorData);
			oView.setModel(errorModel, "errorData");
			var filePath = errorData.filePath;
			var newFilePath = filePath.substring(filePath.lastIndexOf("/") + 1);
			var postData = JSON.stringify({
				filePath: newFilePath,
				linkId: errorData.documentId
			});
			//oView.byId("invoiceFilePdf").setBusy(true);
			documentServices.getInstance().getFile(this, postData, 
				function(oData) {
					//oView.byId("invoiceFilePdf").setBusy(false);
				},
				function(oError) {
					if(oError.status === 200) {
						/*var decodedPdfContent = atob(oError.responseText);
						var byteArray = new Uint8Array(decodedPdfContent.length)
						for(var i=0; i<decodedPdfContent.length; i++){
						    byteArray[i] = decodedPdfContent.charCodeAt(i);
						}
						var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
						errorModel.getData().file = URL.createObjectURL(blob);
						oView.byId("invoiceFilePdf").setBusy(false);
						errorModel.refresh(true);*/
						if(oError.status === 200) {
						errorModel.getData().file = oError.responseText;
						errorModel.refresh(true);
					}
					}
				});
			/*$.ajax({
				type: 'POST',
				headers: { 
			        'Content-Type': 'application/json' 
			    },
				url: "/ocrspring/getInvoiceFile/",
				data: postData,
				dataType: "json",
				success: function(data) {
					oView.byId("invoiceFileImg").setBusy(false);
				},
				error: function(err) {
					MessageBox.error(err);
					if(err.status === 200) {
						errorModel.getData().invoiceFile = err.responseText;
						oView.byId("invoiceFileImg").setBusy(false);
						errorModel.refresh(true);
					}
				}
			});*/
		},
		
		onViewDocument: function (oEvent) {
			var sSource = oEvent.getSource().data("file");
			/*this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("Document");
			this._pdfViewer.open();*/
			var pdfWindow = window.open("", "myWindow", "width=1000, height=800");
			pdfWindow.document.write("<iframe width='100%' height='100%' src='" + sSource +"'></iframe>");
		},
		
		onChangeVendorDetails: function(oEvent) {
			try {
				/*var vendorNoDataModel = oComponent.getModel("VendorNoData");
				var errorModel = oView.getModel("errorData");
				var vendorNoExist = false;
				for(var i = 0; i < vendorNoDataModel.getData().length; i++) {
					if(vendorNoDataModel.getData()[i].vendorName === errorModel.getData().Vendorname 
						&& vendorNoDataModel.getData()[i].pincode === errorModel.getData().Postalcode) {
						errorModel.getData().Vendorno = vendorNoDataModel.getData()[i].vendorNo;
						errorModel.refresh(true);
						vendorNoExist = true;
						break;
					}
				}
				
				if(!vendorNoExist) {
					errorModel.getData().Vendorno = "";
					errorModel.refresh(true);
				}*/
			} catch (ex) {
				MessageBox.error(ex);
			}
		},
		
		onChangeCurrency: function (oEvent) {
			/*var errorModel = oView.getModel("errorData");
			errorModel.getData().currency = */
		},
		
		onUpdate: function(oEvent) {
			try {
				MessageBox.confirm(
					"Do you confirm the update?",
					{
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function(sAction) {
							if(sAction == "OK") {
								sap.ui.core.BusyIndicator.show(0);
								//var errorData = JSON.parse(JSON.stringify(oView.getModel("errorData").getData()));
								var errorData = oView.getModel("errorData").getData();
				
								var invoiceDate = new Date(errorData.documentDate);
							
								var invoiceMonth = "";
								if(invoiceDate.getMonth() < 9) {
									invoiceMonth = "0" + (invoiceDate.getMonth() + 1);
								} else {
									invoiceMonth = (invoiceDate.getMonth() + 1).toString();
								}
								
								invoiceDate = invoiceDate.getFullYear() + "-" + invoiceMonth + "-" + invoiceDate.getDate() + "T00:00:00";
								
								var postData = {
									Servicecall: "FIN",
									UpdOcrScanHdrToItm: [{
										Uniqueid: errorData.uniqueId,
										Invoiceno: errorData.referenceNo,
							            Vendorno: errorData.vendorNo,
							            Invoicetype: "MM",
							            Invoicedate: invoiceDate,
							            Vendorname: errorData.vendorName,
							            Postalcode: errorData.postalCode,
							            Filename: errorData.fileName,
							            Filepath: errorData.filePath,
							            Status: errorData.status,
							            Netvalue: errorData.netValue,
							            Grossvalue: errorData.grossValue,
							            Vat: errorData.tax,
							            Currency: errorData.currency,
							            Timestamp: null,
							            ValidStatus: "VE"
									}]
								};
								var mainServiceModel = oComponent.getModel("mainServiceModel");
								mainServiceModel.create("/UpdOcrScanHdrs", postData, {
									success: function() {
										sap.ui.core.BusyIndicator.hide();
										MessageBox.success(
											"Request updated",
											{
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(sAction) {
													documentServices.getInstance().getValidationErrorDocuments(oController);
													documentServices.getInstance().getAwaitingApprovalDocuments(oController);
													oController.getRouter().navTo("Dashboard");
													//var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
													//oRouter.navTo("Home");
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
				MessageBox.error(ex);
			}
		}
	});
});