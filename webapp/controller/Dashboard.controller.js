sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'../Formatter',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	"sap/m/MessageBox",
	'../InitPage'
], function (Controller, Formatter, JSONModel, ChartFormatter, Format, MessageBox, InitPageUtil) {
	"use strict";
	var oView, oController, oComponent;
	return Controller.extend("demo.cassini.ocr.CassiniOCR.controller.Dashboard", {
		settingsModel : {
            dataset : {
                name: "Dataset",
                defaultSelected : 1,
                values : [{
                    name : "Small",
                    value : "/small.json"
                },{
                    name : "Medium",
                    value : "/medium.json"
                }]
            },
            series : {
                name : "Series",
                defaultSelected : 0,
                enabled : false,
                values : [{
                    name : "1 Series"
                }, {
                    name : '2 Series'
                }]
            },
            dataLabel : {
                name : "Value Label",
                defaultState : false
            },
            axisTitle : {
                name : "Axis Title",
                defaultState : false,
                enabled : false
            }
        },
        
		onInit: function() {
			/*oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			
			// set highlight status of post data model
			var oModel = this.getOwnerComponent().getModel();
			var oData = oModel.getData();
			for (var i = 0; i < oData.PostData.length; i++) {
				var oProduct = oData.PostData[i];
	
				if (oProduct.status === 0) {
					oProduct.highlightStatus = "Error";
				} else if (oProduct.status === 1) {
					oProduct.highlightStatus = "Success";
				} if (oProduct.status === 2) {
					oProduct.highlightStatus = "Error";
				}
			}
			oModel.refresh(true);*/
			
			//var oModel = this.getOwnerComponent().getModel();
			//var postData = oModel.getData().PostData;
			/*var scanningErrorData = oData.PostData.filter(function(data) {
			    return data.status === 0;
			});
			
			var oScanningErrorModel = new sap.ui.model.json.JSONModel({
				PostData: scanningErrorData
			});
			this.getOwnerComponent().setModel(oScanningErrorModel, "ScanningErrorData");
			
			
			
			Format.numericFormatter(ChartFormatter.getInstance());
            // set explored app's demo model on this sample
            var oSettingsModel = new JSONModel(this.settingsModel);
            oSettingsModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
            this.getView().setModel(oSettingsModel);
            
            var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
            oVizFrame.setVizProperties({
                title: {
                    visible: false
                },
                plotArea: {
                    dataLabel: {
                        visible: true
                    }
                }
            });
            
            var chartDataModel = oComponent.getModel("chartData"); 
            
            var dataModel = new JSONModel({
            	chart: chartDataModel.getData()
            });
            oVizFrame.setModel(dataModel);
            
            var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(oVizFrame.getVizUid());
            oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
            
            InitPageUtil.initPageSettings(this.getView());*/
            
            /*var that = this;
            dataModel.attachRequestCompleted(function() {
                that.dataSort(this.getData());
            });*/
			
			
			
			
			
			
			/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("Dashboard").attachPatternMatched(this._onObjectMatched, this);*/
		},
		
		_onObjectMatched: function() {
		    oComponent.getNonSapErrorData(oController, ["btnScanningErrors"]);
		    oComponent.getSapErrorData(oController, ["btnValidationErrors"]);
		    oComponent.getMgrApprovalData(oController, ["btnDueForApproval"]);
		    oComponent.getFiReviewRecords(oController, ["tblReadyToPost"]);
		    oComponent.getCompletedRecords(oController);
		    
			// my logic here    
		},
		
		/*onPost: function(oEvent) {
			var source = oEvent.getSource();
			source.setBusy(true);
			setTimeout(function(){ 
				var parent = source.getParent().getParent();
				$("#" + parent.getId() + "-highlight").addClass("posted");
				source.setBusy(false);
				$("#" + parent.getId() + "-highlight").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',   
				function(e) {
			    	var oModel = oComponent.getModel();
					var postData = oModel.getData().PostData;
					var postId = source.data("postId");
					for(var i = 0; i < postData.length; i++) {
						if(postId === postData[i].postId) {
							postData.splice(i, 1);
						}
					}
					oModel.refresh(true);
				}); 
				
			}, 3000);
			
		},*/
		
		onPost: function(oEvent) {
			try {
				var source = oEvent.getSource();
				
				var row = source.getParent();
				var sPath = row.getBindingContext('FiReviewRecords').getPath();
				var selectedRecord = row.getBindingContext('FiReviewRecords').getModel().getProperty(row.getBindingContext('FiReviewRecords').getPath());
				
				
				
				source.setBusy(true);
				var reviewedData = JSON.parse(JSON.stringify(selectedRecord));
				
				
				$.ajax("http://localhost:8090/OcrRestSpring/getTaxRate/"+ reviewedData.VendorCountry + "/" + reviewedData.Companycode + "/", {
					success: function(data) {
						console.log(data);
						//recordlModel.getData().Taxcode = data.taxCode;
						//recordlModel.getData().Taxrate = data.taxRate;
						var tax = (parseFloat(reviewedData.Netvalue) * parseFloat(data.taxRate)) / 100;
						//recordlModel.getData().Vat = tax;
						//recordlModel.refresh(true);
						
						
						
						reviewedData.UpdOcrHdrToOcrItm = reviewedData.GetOcrHdrToOcrItm;
				
						for(var i = 0; i < reviewedData.UpdOcrHdrToOcrItm.results.length; i++) {
							//reviewedData.UpdOcrHdrToOcrItm.results[i].Message = "";
							reviewedData.UpdOcrHdrToOcrItm.results[i].FinReviewed = "X";
							delete reviewedData.UpdOcrHdrToOcrItm.results[i].Paymentindays;
							delete reviewedData.UpdOcrHdrToOcrItm.results[i].VendorCountry;
							delete reviewedData.UpdOcrHdrToOcrItm.results[i].__metadata;
						}
						
						var postingDate = new Date(reviewedData.Postingdate);
					
						var postingMonth = "";
						if(postingDate.getMonth() < 9) {
							postingMonth = "0" + (postingDate.getMonth() + 1);
						} else {
							postingMonth = (postingDate.getMonth() + 1).toString();
						}
						
						postingDate = postingDate.getFullYear() + "-" + postingMonth + "-" + postingDate.getDate() + "T00:00:00";
						
						var documentDate = new Date(reviewedData.Invoicedate);
					
						var documentMonth = "";
						if(documentDate.getMonth() < 9) {
							documentMonth = "0" + (documentDate.getMonth() + 1);
						} else {
							documentMonth = (documentDate.getMonth() + 1).toString();
						}
						
						documentDate = documentDate.getFullYear() + "-" + documentMonth + "-" + documentDate.getDate() + "T00:00:00";
						
						var postData = {
							Servicecall: "FIN",
							PostingDate: postingDate,
							MgrComment: reviewedData.MgrComment,
							Vat: reviewedData.Vat.toString(),
							TaxCode: data.taxCode,
							DocumentDate: documentDate,
							CalcTax: "X",
							UpdOcrHdrToOcrItm: reviewedData.UpdOcrHdrToOcrItm
						};
						
						var mainServiceModel = oComponent.getModel("mainServiceModel");
						mainServiceModel.create("/UpdOcrHdrs", postData, {
							success: function(postResponse) {
								
								
								var parent = source.getParent().getParent();
								$("#" + parent.getId() + "-highlight").addClass("posted");
								source.setBusy(false);
								$("#" + parent.getId() + "-highlight").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',   
								function(e) {
							    	var oFiRecordsModel = oComponent.getModel("FiReviewRecords");
									var totalFiRecords = oFiRecordsModel.getData();
									
									for(var i = 0; i < totalFiRecords.length; i++) {
										if(reviewedData.Uniqueid === totalFiRecords[i].Uniqueid) {
											totalFiRecords.splice(i, 1);
										}
									}
									oFiRecordsModel.refresh(true);
								});
								
								
								MessageBox.success(
									"Document no. " + postResponse.UpdOcrHdrToOcrItm.results[0].Sapinvoice + " posted successfully",
									{
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(sAction) {
											var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
											oRouter.navTo("Home");
										}
									}
								);
							},
							error: function(oError) {
								console.log(oError);
							}
						});
					},
					error: function(err) {
						console.log(err);
			    	}
			   });	
			} catch (ex) {
				console.log(ex);
			}
		},
		
		onGoToScanningErrors: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
			oRouter.navTo("ScanningErrors");
		},
		
		onGoToValidationErrors: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
			oRouter.navTo("ValidationErrors");
		},
		
		onGoToReadyToPost: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
			oRouter.navTo("ReadyToPost");
		},
		
		onGoToDueForApproval: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
			oRouter.navTo("DueForApproval");
		}
	});
});