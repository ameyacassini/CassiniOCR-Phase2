/*!
 * ${copyright}
 */
// Provides control cassini.custom.Example.
sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/Control"],
	function (jQuery, library, Control) {
		"use strict";
		/**
		 * Constructor for a new Example control.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Some class description goes here.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias cassini.custom.controls.Example
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Example = Control.extend("cassini.sim.controls.Example", {
			metadata: {
				library: "cassini.sim",
				properties: {

					/**
					 * text
					 */
					text: {
						type: "string",
						group: "Misc",
						defaultValue: null
					}

				},
				events: {
					/**
					 * Event is fired when the user clicks on the control.
					 */
					press: {}

				}
			}
		});
		return Example;
	}, /* bExport= */ true);