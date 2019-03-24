sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.LineItem", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.amountDue = data.amountDue;
				this.currency = data.currency;
				this.date = data.date;
				this.description = data.description;
				this.filePath = data.filePath;
				this.ftfName = data.ftfName;
				this.id = data.id;
				this.invoiceFile = data.invoiceFile;
				this.item = data.item;
				this.lineTotal = data.lineTotal;
				this.linkId = data.linkId;
				this.migration = data.migration;
				this.poNo = data.poNo;
				this.postalCode = data.postalCode;
				this.quantity = data.quantity;
				this.refNo = data.refNo;
				this.shippingAndHandling = data.shippingAndHandling;
				this.status = data.status;
				this.subTotal = data.subTotal;
				this.tax = data.tax;
				this.unitPrice = data.unitPrice;
				this.vendor = data.vendor;
				
				
				/*this.item = data.item;
				this.description = data.description;
				this.quantity = data.quantity;
				this.unitPrice = this.unitPrice;
				this.lineTotal = this.lineTotal;*/
				this.isMapped = false;
			}
		}
	});
});