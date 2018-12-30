sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"cassini/sim/service/utilities",
	"cassini/sim/model/Document",
	"cassini/sim/model/Report",
	"cassini/sim/model/POItem"
], function (Object, JSONModel, utilities, Document, Report, POItem) {
	"use strict";
	var instance;
	var documentServices = Object.extend("cassini.sim.service.documentServices", {
		constructor: function () {},
		getSuccesfullyScannedDocuments: function (oController, fnCallback) {
			utilities.getInstance().getHttp(
				{	oController: oController, sUrl: "/ocrspring/ocr/", 
					fnSuccess: function(oData) {
						var oModel = new JSONModel();
						oModel.setData(instance.toScannedDocuments(oData));
						oController.getOwnerComponent().setModel(oModel, "successfullyScannedDocuments");
						Report.getInstance().calculateSuccessRate(oController);
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getManualVerificationDocuments: function (oController, fnCallback) {
			utilities.getInstance().getHttp(
				{	oController: oController, sUrl: "/ocrclient/Documents/filter?role=20", 
					fnSuccess: function(oData) {
						var oModel = new JSONModel();
						oModel.setData(instance.toManualVerifyDocuments(oData));
						oController.getOwnerComponent().setModel(oModel, "manualVerifyDocuments");
						Report.getInstance().calculateSuccessRate(oController);
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getValidationErrorDocuments: function (oController, fnCallback) {
			utilities.getInstance().read(
				{	oController: oController, sModelName: "mainServiceModel", sEntity: "GetOcrScanErrs",
					fnSuccess: function(data) {
						var oModel = new JSONModel();
						oModel.setData(instance.toSAPDocuments(data.results));
						oController.getOwnerComponent().setModel(oModel, "validationErrorsDocuments");
						Report.getInstance().calculateSuccessRate(oController);
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getAwaitingApprovalDocuments: function (oController, fnCallback) {
			utilities.getInstance().read(
				{	oController: oController, sModelName: "mainServiceModel", sEntity: "GetOcrHdrs",
					filters: [ new sap.ui.model.Filter("Servicecall", sap.ui.model.FilterOperator.EQ, "MGR")],
					expand: "GetOcrHdrToOcrItm",
					fnSuccess: function(data) {
						var oModel = new JSONModel();
						oModel.setData(instance.toSAPDocuments(data.results));
						oController.getOwnerComponent().setModel(oModel, "awaitingApprovalDocuments");
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getApprovedDocuments: function (oController, fnCallback) {
			utilities.getInstance().read(
				{	oController: oController, sModelName: "mainServiceModel", sEntity: "GetOcrHdrs",
					filters: [ new sap.ui.model.Filter("Servicecall", sap.ui.model.FilterOperator.EQ, "FIN")],
					expand: "GetOcrHdrToOcrItm",
					fnSuccess: function(data) {
						var oModel = new JSONModel();
						oModel.setData(instance.toSAPDocuments(data.results));
						oController.getOwnerComponent().setModel(oModel, "approvedDocuments");
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getPostedDocuments: function (oController, fnCallback) {
			utilities.getInstance().read(
				{	oController: oController, sModelName: "mainServiceModel", sEntity: "GetApprovalDataSet",
					fnSuccess: function(oData) {
						var postedDocuments = [];
						var results = oData.results;
						for(var i = 0; i < results.length; i++) {
							var recordExist = false;
							for(var j = 0; j < postedDocuments.length; j++) {
								if(results[i].Uniqueid === postedDocuments[j].Uniqueid) {
									recordExist = true;
									break;
								}
							}
							if(!recordExist && results[i].FinReviewed === "X" && results[i].MgrApproved === "X") {
								postedDocuments.push(results[i]);
							}
						}
						var oModel = new JSONModel();
						oModel.setData(instance.toSAPDocuments(postedDocuments));
						oController.getOwnerComponent().setModel(oModel, "postedDocuments");
						if(fnCallback)
							fnCallback();
					}
				});
		},
		getAnalyticsReport: function (oController, sYear, arrCharts) {
			for(var i = 0; i < arrCharts.length; i++) {
				arrCharts[i].setBusy(true);
			}
			utilities.getInstance().getHttp(
				{	oController: oController, sUrl: "/ocrspring/ocr/getAnalyticsData/" + sYear + "/", 
					fnSuccess: function(oData) {
						Report.getInstance().generate(oData, sYear, oController);
						Report.getInstance().updateChart(arrCharts);
					}
				});
		},
		getTaxRate: function (oController, sCountry, sCompanyCode, fnSuccess) {
			utilities.getInstance().getHttp(
				{	oController: oController, sUrl: "/ocrspring/getTaxRate/" + sCountry + "/" + sCompanyCode + "/", 
					fnSuccess: fnSuccess
				});
		},
		calculateTax: function (netValue, taxRate) {
			return (parseFloat(netValue) * parseFloat(taxRate)) / 100;
		},
		getFile: function (oController, oPostData, fnSuccess, fnError) {
			utilities.getInstance().postHttp(
				{	oController: oController, sUrl: "/ocrspring/getInvoiceFile/", 
					oPostData: oPostData,
					fnSuccess: fnSuccess,
					fnError: fnError
				});
		},
		toManualVerifyDocuments: function (data) {
			var documents = [];
			for (var i = 0, len = data.length; i < len; i++) {
				var document = new Document({
					documentId: (i >= 9) ? ("000" + (i + 1)) : ("0000" + (i + 1)),
					batchId: data[i].BatchId,
					batchName: data[i].BatchName,
					lastRole: data[i].LastRole,
					createdOn: data[i].CreatedOn,
					updatedOn: data[i].UpdatedOn
				});
				documents.push(document);
			}
			return documents;
		},
		toScannedDocuments: function (data) {
			var documents = [];
			for (var i = 0, len = data.length; i < len; i++) {
				var document = new Document({
					documentId: data[i].linkId,
					vendorName: data[i].vendor,
					documentDate: data[i].date,
					referenceNo: data[i].refNo,
					poNumber: data[i].poNo,
					netValue: data[i].subTotal,
					tax: data[i].tax,
					shippingAndHandling: data[i].shippingAndHandling,
					grossValue: data[i].amountDue,
					status: data[i].status,
					postalCode: data[i].postalCode,
					currency: data[i].currency,
					fileName: data[i].invoiceFile,
					filePath: data[i].filePath
				});
				documents.push(document);
			}
			return documents;
		},
		toSAPDocuments: function (data) {
			var documents = [];
			for (var i = 0, len = data.length; i < len; i++) {
				var document = new Document({
					currency: data[i].Currency,
					fileName: data[i].Filename,
					filePath: data[i].Filepath,
					grossValue: data[i].Grossvalue,
					documentDate: data[i].Invoicedate,
					postingDate: data[i].Postingdate,
					referenceNo: data[i].Invoiceno,
					documentType: data[i].Invoicetype,
					documentId: data[i].Linkid,
					netValue: data[i].Netvalue,
					postalCode: data[i].Postalcode,
					status: data[i].Status,
					timeStamp: data[i].Timestamp,
					uniqueId: data[i].Uniqueid,
					validStatus: data[i].ValidStatus,
					tax: data[i].Vat,
					vendorName: data[i].Vendorname,
					vendorNo: data[i].Vendorno,
					vendorCountry: (data[i].GetOcrHdrToOcrItm && data[i].GetOcrHdrToOcrItm.results) ? data[i].GetOcrHdrToOcrItm.results[0].VendorCountry : "",
					companyCode: (data[i].GetOcrHdrToOcrItm && data[i].GetOcrHdrToOcrItm.results) ? data[i].GetOcrHdrToOcrItm.results[0].Companycode : "",
					mgrComment: data[i].MgrComment,
					tacCode: data[i].Taxcode,
					sapInvoice: data[i].Sapinvoice,
					ocrYear: data[i].OcrYear,
					poItems: (data[i].GetOcrHdrToOcrItm && data[i].GetOcrHdrToOcrItm.results) ? this.toSAPPOItems(data[i].GetOcrHdrToOcrItm.results) : [] 
				});
				documents.push(document);
			}
			return documents;
		},
		toSAPPOItems: function (data) {
			var poItems = [];
			for (var i = 0, len = data.length; i < len; i++) {
				var item = new POItem({
					companyCode: data[i].Companycode,
					description: data[i].Description,
					finReviewed: data[i].FinReviewed,
					invoiceNo: data[i].Invoiceno,
					material: data[i].Material,
					message: data[i].Message,
					mgrApproved: data[i].MgrApproved,
					netPrice: data[i].Netprice,
					ocrYear: data[i].OcrYear,
					paymentInDays: data[i].Paymentindays,
					paymentTerm: data[i].Paymentterm,
					poItem: data[i].Poitem,
					poItemQuantity: data[i].PoitemQuantity,
					poItemText: data[i].PoitemText,
					poItemUom: data[i].PoitemUom,
					poNumber: data[i].Ponumber,
					refDocItm: data[i].RefDocItm,
					refDocNum: data[i].RefDocNum,
					sapInvoice: data[i].Sapinvoice,
					taxCode: data[i].Taxcode,
					uniqueId: data[i].Uniqueid,
					vendorCountry: data[i].VendorCountry,
					vendorNo: data[i].Vendorno
				});
				poItems.push(item);
			}
			return poItems;
		}
	});
	return {
		getInstance: function () {
			if (!instance) {
				instance = new documentServices();
			}
			return instance;
		}
	};
});