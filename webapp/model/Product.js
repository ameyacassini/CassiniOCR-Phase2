sap.ui.define([
	"cassini/sim/model/BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("cassini.sim.model.Product", {
		constructor: function (data) {
			BaseObject.call(this);
			if (data) {
				this.Product = data.Product;
				this.Volume = data.Volume;
			}
		}
	});
});