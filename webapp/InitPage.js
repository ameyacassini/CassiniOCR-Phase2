sap.ui.define([
   ], function() {
    return {
        initPageSettings : function(oView, sVizFrame, sChart, legendFlag) {
        	// Hide Settings Panel for phone
            if (sap.ui.Device.system.phone) {
                var oSettingsPanel = oView.byId('settingsPanel');
                if(oSettingsPanel){
                    oSettingsPanel.setExpanded(false);
                }
            }

            // try to load sap.suite.ui.commons for using ChartContainer
            // sap.suite.ui.commons is available in sapui5-sdk-dist but not in demokit
            var libraries = sap.ui.getVersionInfo().libraries || [];
            var bSuiteAvailable = libraries.some(function(lib){
                return lib.name.indexOf("sap.suite.ui.commons") > -1;
            });
            if (bSuiteAvailable) {
                jQuery.sap.require("sap/suite/ui/commons/ChartContainer");
                var vizframe = oView.byId(sVizFrame);
                /*var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
                    icon : "sap-icon://donut-chart",
                    title : "vizFrame Donut Chart Sample",
                    content : [ vizframe ]
                });*/
                var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
                    content : [ vizframe ]
                });
                var oChartContainer = new sap.suite.ui.commons.ChartContainer({
                    content : [ oChartContainerContent ]
                });
                 oChartContainer.setShowLegend(legendFlag);
                 oChartContainer.setShowLegendButton(legendFlag);
                oChartContainer.setShowFullScreen(false);
                oChartContainer.setAutoAdjustHeight(true);
                oChartContainer.setShowZoom(false);
                oView.byId(sChart).setFlexContent(oChartContainer); 
            }
        }
    };
});