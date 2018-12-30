sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.Vendor", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.Vendor = data.Vendor;
				this.Revenue = data.Revenue;
			}
		},
		getChartData: function () {
			return {
				Vendor: this.Vendor,
				Revenue: this.Revenue
			};
		}
	});
});