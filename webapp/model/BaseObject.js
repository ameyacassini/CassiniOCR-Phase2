sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
	"use strict";
	return Object.extend("cassini.sim.model.BaseObject", {
		constructor: function () {
			this.model = new JSONModel();
			this.model.setData(this);
		},
		getModel: function () {
			return this.model;
		}
	});
});