sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.Document", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.uniqueId = data.uniqueId;
				this.documentId = data.documentId;
				this.documentType = data.documentType;
				this.batchId = data.batchId;
				this.batchName = data.batchName;
				this.vendorNo = data.vendorNo;
    			this.vendorName = data.vendorName;
    			this.referenceNo = data.referenceNo;
    			this.poNumber = data.poNumber;
    			this.grossValue = data.grossValue;
    			this.netValue = data.netValue;
    			this.tax = data.tax;
    			this.taxCode = data.taxCode;
    			this.taxRate = data.taxRate;
    			this.shippingAndHandling = data.shippingAndHandling;
    			this.amountDue = data.amountDue;
    			this.status = data.status;
    			this.validStatus = data.validStatus;
    			this.documentDate = data.documentDate;
    			this.postingDate = data.postingDate;
    			this.timeStamp = data.timeStamp;
    			this.postalCode = data.postalCode;
    			this.currency = (data.currency) ? data.currency : "EUR";
    			this.fileName = data.fileName;
    			this.filePath = data.filePath;
    			this.workflow = 1;
    			this.mgrComment = data.mgrComment;
    			this.vendorCountry = data.vendorCountry;
    			this.companyCode = data.companyCode;
    			this.sapInvoice = data.sapInvoice;
    			this.ocrYear = data.ocrYear;
    			this.poItems = data.poItems;
    			this.selectedPoItems = [];
    			this.createdOn = data.createdOn;
    			this.updatedOn = data.updatedOn;
			}
			
			this.lineItems = [];
		},
		
		addLineItem: function (lineItem) {
			this.lineItems.push(lineItem);
			this.model.refresh();
		},
		
		getSAPPostData: function (isFinReviewed) {
			var serviceCall = "";
			if(isFinReviewed)
				serviceCall = "FIN";
			else
				serviceCall = "MGR";
			return {
				Servicecall: serviceCall,
				PostingDate: (this.postingDate) ? this.postingDate.toJSON().split(".")[0] : new Date().toJSON().split(".")[0],
				MgrComment: this.mgrComment,
				Vat: this.tax.toString(),
				TaxCode: (this.taxCode) ? this.taxCode : "",
				DocumentDate: this.documentDate.toJSON().split(".")[0],
				CalcTax: "X",
				UpdOcrHdrToOcrItm: (!isFinReviewed) ? this.getSAPPOItems(this.selectedPoItems, isFinReviewed) : this.getSAPPOItems(this.poItems, isFinReviewed)	
			};
		},
		
		getSAPPOItems: function (arrItems, isFinReviewed) {
			var poItems = [];
			for(var i = 0; i < arrItems.length; i++) {
				var poItem = arrItems[i].getSAPPostData(isFinReviewed);
				var fPoQuantity = parseFloat(poItem.PoitemQuantity);
				if(isFinReviewed || (!isNaN(fPoQuantity) && fPoQuantity > 0)) {
					poItems.push(arrItems[i].getSAPPostData(isFinReviewed));
				}
			}
			return poItems;
		}
	});
});