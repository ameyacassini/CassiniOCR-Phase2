sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.LineItem", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.item = data.item;
				this.description = data.description;
				this.quantity = data.quantity;
				this.unitPrice = this.unitPrice;
				this.lineTotal = this.lineTotal;
			}
		}
	});
});