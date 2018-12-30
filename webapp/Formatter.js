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
	    },
	    
	    availableState: function (sStateValue) {
			var sStateValueToLower = sStateValue;
			if(sStateValueToLower)
				sStateValueToLower = sStateValueToLower.toLowerCase();

			switch (sStateValueToLower) {
				case "approved":
					return 8;
				case "approval pending":
					return 5;
				case "rejected":
					return 3;
				default:
					return 9;
			}
		}
	};

	return Formatter;

}, /* bExport= */ true);
