/*!
 * ${copyright}
 */
// Provides control cassini.custom.Tile.
sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/Control", "cassini/sim/controls/type/TitleLevel"],
	function (jQuery, library, Control, TitleLevel) {
		"use strict";
		/**
		 * Constructor for a new Tile control.
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
		 * @alias cassini.custom.controls.Tile
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Tile = Control.extend("cassini.sim.controls.Tile", {
			metadata: {
				properties: {

					/**
					 * title
					 */
					title: {
						type: "string",
						group: "Misc",
						defaultValue: null
					},
					description: {
						type: "string",
						group: "Misc",
						defaultValue: null
					},
					titleLevel: {
						type: "cassini.sim.controls.type.TitleLevel",
						defaultValue: TitleLevel.H3
					},
					width: {
                    	type: "sap.ui.core.CSSSize",
                    	defaultValue: "auto"
	                },
	                height: {
	                      type: "sap.ui.core.CSSSize",
	                      defaultValue: "auto"
	                },
	                margin: {
	                      type: "sap.ui.core.CSSSize",
	                      defaultValue: "0"
	                },
	                padding: {
	                      type: "sap.ui.core.CSSSize",
	                      defaultValue: "1rem"
	                }

				},
				aggregations: {
                    content: {
                        type: "sap.ui.core.Control"
                    }
                },
				events: {
					/**
					 * Event is fired when the user clicks on the control.
					 */
					press: {}

				},
                defaultAggregation: "content"
			},
  
            init: function() {
                //initialisation code, in this case, ensure css is imported
                var libraryPath = jQuery.sap.getModulePath("cassini.sim"); //get the server location of the ui library
                jQuery.sap.includeStyleSheet(libraryPath + "/controls/tile.css"); //specify the css path relative from the ui folder
            },
            
            onclick: function (oEvent) {
            	this.firePress(oEvent);
            },
            
            renderer: function (oRm, oControl) {
				//first up, render a div for the ShadowBox
                oRm.write("<div");
                
                //add this controls style class (plus any additional ones the developer has specified)
                oRm.addClass("casTile");
                oRm.writeClasses(oControl);
                
                //render width & height properties
                oRm.write(" style=\"width: " + oControl.getWidth() + "; height: " + oControl.getHeight() + "; margin: " + oControl.getMargin() + "; padding: " + oControl.getPadding() + ";\"");
                //next, render the control information, this handles your sId (you must do this for your control to be properly tracked by ui5).
                oRm.writeControlData(oControl);
                oRm.write(">");
                oRm.write("<div class='casTileWrapper'>");
    			if( oControl.getTitle()) {
    				oRm.write("<" + oControl.getTitleLevel() +  " class='casTileTitle'>" + oControl.getTitle()  + "</" + oControl.getTitleLevel() + ">");	
    			}
    			
                //next, iterate over the content aggregation, and call the renderer for each control
                $(oControl.getContent()).each(function(){
                    oRm.renderControl(this);
                });
                
                if(oControl.getDescription()) {
    				oRm.write("<span class='casTileDescription'>" + oControl.getDescription()  + "</span>");	
    			}
    			
    			oRm.write("</div>");
                //and obviously, close off our div
                oRm.write("</div>");

			}
		});
		return Tile;
	}, /* bExport= */ true);