sap.ui.define([
	"cassini/sim/model/BaseObject",
	"cassini/sim/model/Vendor",
	"cassini/sim/model/Product"
], function (BaseObject, Vendor, Product) {
	"use strict";
	var instance;
	var Report = BaseObject.extend("cassini.sim.model.Report", {
		constructor: function (data) {
			BaseObject.call(this);
			this.successRate = 0;
			this.totalDocumentProcess = 0;
			this.documentExceptionRate = 0;
			this.activeVendors = 0;
			this.topVendors = [];
			this.topProducts = [];
			this.year = new Date().getFullYear();
		},
		generate: function (oData, sYear, oController) {
			this.totalDocumentProcess = oData.totalInvoiceCount;
			this.documentExceptionRate = oData.invoiceExceptionRate;
			this.activeVendors = oData.vendorCount;
			for (var vendor in oData.topVendorData) {
				//this.addVendor(new Vendor({Vendor: vendor, Revenue: parseFloat(oData.topVendorData[vendor])}));
				this.addVendor(new Vendor({Vendor: vendor, Revenue: parseFloat(oData.topVendorData[vendor])}).getChartData());
				//this.addVendor(new Vendor({Vendor: vendor, Revenue: oData.topVendorData[vendor].toString()}));
			}
			
			for (var product in oData.topProductData) {
				this.addProduct(new Product({Product: product, Volume: parseFloat(oData.topProductData[product])}));
			}
			instance.updateModel(oController);
		},
		
		addProduct: function(product) {
			this.topProducts.push(product);
		},
		
		addVendor: function(vendor) {
			this.topVendors.push(vendor);
		},
		calculateSuccessRate: function (oController) {
			var successfullyScannedDocuments = oController.getOwnerComponent().getModel("successfullyScannedDocuments");
			var manualVerifyDocuments = oController.getOwnerComponent().getModel("manualVerifyDocuments");
			var validationErrorsDocuments = oController.getOwnerComponent().getModel("validationErrorsDocuments");
			
			if(successfullyScannedDocuments && manualVerifyDocuments && validationErrorsDocuments) {
				var totalScanned = successfullyScannedDocuments.getData().length + manualVerifyDocuments.getData().length + validationErrorsDocuments.getData().length;
				if(totalScanned > 0)
					this.successRate = parseInt(((successfullyScannedDocuments.getData().length / totalScanned) * 100), 10);
				else
					this.successRate = 0;
			} else {
				this.successRate = 0;
			}
			instance.updateModel(oController);
		},
		updateModel: function (oController) {
			var oReportModel = oController.getOwnerComponent().getModel("report");
			if(oReportModel) {
				oReportModel.setData(instance.getModel().getData());
				oReportModel.refresh(true);
			} else {
				oController.getOwnerComponent().setModel(instance.getModel(),"report");	
			}
		},
		updateChart: function (charts) {
			for(var i = 0; i < charts.length; i++) {
				var dataModel = charts[i].getModel();
	            dataModel.setData({
	            	topVendors: instance.getModel().getData().topVendors,
	            	topProducts: instance.getModel().getData().topProducts
	            });
	            dataModel.refresh(true);
	            charts[i].setBusy(false);
			}
			
		}
	});
	return {
		getInstance: function () {
			if (!instance) {
				instance = new Report();
			}
			return instance;
		}
	};
});