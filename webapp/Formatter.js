sap.ui.define(function() {
	"use strict";

	var Formatter = {

		postStatusIcon : function (sValue) {
			var sIcon;
			switch (sValue) {
				case 1:
					sIcon = "sap-icon://print";
					break;
				case 2:
					sIcon = "sap-icon://travel-expense-report";
					break;
				default:
					sIcon = "";
			}
			return sIcon;
		},
		
		workflowIcon : function (sValue) {
			var sIcon;
			switch (sValue) {
				case 1:
					sIcon = "sap-icon://accept";
					break;
				case 2:
					sIcon = "sap-icon://decline";
					break;
				default:
					sIcon = "";
			}
			return sIcon;
		},
		
		currency: function(amount, currency) {
			var change = [];
	        change.push(amount);
	        change.push(currency);
	        var sInternalType = "";
	        var amount1 = new sap.ui.model.type.Currency();
			amount1.formatValue(change, sInternalType);
	    	return amount1;
	    }
	};

	return Formatter;

}, /* bExport= */ true);
