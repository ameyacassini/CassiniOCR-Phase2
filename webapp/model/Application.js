sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
	"use strict";
	var instance;
	var documentServices = Object.extend("cassini.sim.model.Application", {
		constructor: function () {},
		setComponent: function(oComponent) {
			this.Component = oComponent;
		},
		getComponent: function() {
			return this.Component;
		}
	});
	return {
		getInstance: function () {
			if (!instance) {
				instance = new documentServices();
			}
			return instance;
		}
	};
});