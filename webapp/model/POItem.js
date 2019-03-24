sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.POItem", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.id = data.id;
				this.companyCode = data.companyCode;
				this.description = data.description;
				this.finReviewed = data.finReviewed;
				this.invoiceNo = data.invoiceNo;
				this.material = data.material;
				this.message = data.message;
				this.mgrApproved = data.mgrApproved;
				this.netPrice = data.netPrice;
				this.ocrYear = data.ocrYear;
				this.paymentInDays = data.paymentInDays;
				this.paymentTerm = data.paymentTerm;
				this.poItem = data.poItem;
				this.poItemQuantity = data.poItemQuantity;
				this.poItemText = data.poItemText;
				this.poItemUom = data.poItemUom;
				this.poNumber = data.poNumber;
				this.refDocItm = data.refDocItm;
				this.refDocNum = data.refDocNum;
				this.sapInvoice = data.sapInvoice;
				this.taxCode = data.taxCode;
				this.uniqueId = data.uniqueId;
				this.vendorCountry = data.vendorCountry;
				this.vendorNo = data.vendorNo;
				this.qtyToDisplay = data.qtyToDisplay;
				this.vendorMaterialDesc = data.vendorMaterialDesc;
				this.setValueState("mappingValueState", sap.ui.core.ValueState.None);
				this.mappingValueStateText = "";
				this.priceLowLimit = data.priceLowLimit;
				this.priceUpLimit = data.priceUpLimit;
				this.qtyLowLimit = data.qtyLowLimit;
				this.qtyUpLimit = data.qtyUpLimit;
				this.webre = data.webre;
				this.priceValueState = "None";
				
				if(this.message === "GRND") {
					this.messageValueState = "Error";
					this.messageValueStateText = "Good Reciept Not Done";
				} else {
					this.messageValueState = "None";
					this.messageValueStateText = "";
				}
			}
			this.status = "None";
			this.lineItemPrice = 0;
		},
		
		setValueState: function(sProperty, sValueState) {
			this[sProperty] = sValueState;
		},
		
		getSAPPostData: function(isFinReviewed) {
			var oPostData = {
				Companycode: this.companyCode,
				Description: this.description,
				FinReviewed: (isFinReviewed) ? "X" : this.finReviewed,
				Invoiceno: this.invoiceNo,
				Material: this.material,
				Message: this.message,
				MgrApproved: (!isFinReviewed) ? "X": this.mgrApproved,
				Netprice: this.netPrice,
				OcrYear: this.ocrYear,
				Paymentindays: this.paymentInDays,
				Paymentterm: this.paymentTerm,
				Poitem: this.poItem,
				PoitemQuantity: this.poItemQuantity.toString(),
				PoitemText: this.poItemText,
				PoitemUom: this.poItemUom,
				Ponumber: this.poNumber,
				RefDocItm: this.refDocItm,
				RefDocNum: this.refDocNum,
				Sapinvoice: this.sapInvoice,
				Taxcode: this.taxCode,
				Uniqueid: this.uniqueId,
				VendorCountry: this.vendorCountry,
				Vendorno: this.vendorNo
			};
			
			if(!isFinReviewed) {
				oPostData.VenMattxt = this.vendorMaterialDesc;
				oPostData.MatnrVen = "";
			}
			
			return oPostData;
		}
		
	});
});