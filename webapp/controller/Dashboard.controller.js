sap.ui.define([
	"cassini/sim/controller/BaseController",
	'../Formatter',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	"sap/m/MessageBox",
	"cassini/sim/model/Report",
	"cassini/sim/service/documentServices",
	"cassini/sim/service/utilities",
	'../InitPage'
], function (BaseController, Formatter, JSONModel, ChartFormatter, Format, MessageBox, Report, documentServices, utilities, InitPageUtil) {
	"use strict";
	var oView, oController, oComponent;
	return BaseController.extend("cassini.sim.controller.Dashboard", {
		onInit: function() {
			oController = this;
			oView = this.getView();
			oComponent = this.getOwnerComponent();
			
			var vfTopVendors = this.vfTopVendors = this.getView().byId("vfTopVendors");
            vfTopVendors.setVizProperties({
                title: {
                    text: "Top 5 Vendors by Value"
                },
                plotArea: {
                    dataLabel: {
                        visible: true
                    }
                }
            });
            
            var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(vfTopVendors.getVizUid());
            oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
            
            InitPageUtil.initPageSettings(this.getView(), "vfTopVendors", "chartTopVendors", false);
            
            var vfTopProducts = this.vfTopProducts = this.getView().byId("vfTopProducts");
            vfTopProducts.setVizProperties({
                title: {
                    text: "Top 5 Products by Volume"
                },
                plotArea: {
                    dataLabel: {
                        visible: true
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                }
            });
            
            var dataModel = new JSONModel({
            	topVendors: Report.getInstance().getModel().getData().topVendors,
            	topProducts: Report.getInstance().getModel().getData().topProducts
            });
            vfTopVendors.setModel(dataModel);
            
            /*var dataModelTopProducts = new JSONModel({
            	topProducts: Report.getInstance().getModel().getData().topProducts
            });*/
            vfTopProducts.setModel(dataModel);
            
            var oPopOverBar = this.getView().byId("idPopOverBar");
            oPopOverBar.connect(vfTopVendors.getVizUid());
            oPopOverBar.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
            
            InitPageUtil.initPageSettings(this.getView(), "vfTopProducts", "chartTopProducts", false);
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        	oRouter.getRoute("Dashboard").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function() {
			documentServices.getInstance().getAnalyticsReport(this, new Date().getFullYear(), [this.vfTopVendors, this.vfTopProducts]);
			//documentServices.getInstance().getValidationErrorDocuments(this);
			//documentServices.getInstance().getAwaitingApprovalDocuments(this);
			oView.byId("tileSuccessfullyScanned").focus();
			
		},
		
		onAfterRendering: function() {
			
		},
		
		onPost: function(oEvent) {
			try {
				//var source = oEvent.getSource();
				
				var oRow = oEvent.getSource().getParent();
				var oBindingContext = oRow.getBindingContext('approvedDocuments');
				var oBindingModel = oBindingContext.getModel();
				var sPath = oBindingContext.getPath();
				
				/** @type {cassini.sim.model.Document} */
				var oSelectedRecord = oBindingModel.getProperty(sPath);
				
				
				var oSource = oEvent.getSource();
				oSource.setBusy(true);
				
				documentServices.getInstance().getTaxRate(oController, oSelectedRecord.vendorCountry, oSelectedRecord.companyCode,
					function(oData) {
						oSelectedRecord.tax = documentServices.getInstance().calculateTax(oSelectedRecord.netValue, oData.taxRate);
						oSelectedRecord.taxCode = (oData.taxCode) ? oData.taxCode : "";
						oBindingModel.refresh(true);
						utilities.getInstance().create(
							{	oController: oController, sModelName: "mainServiceModel", sEntity: "UpdOcrHdrs",
								oPostData: oSelectedRecord.getSAPPostData(true),           
								fnSuccess: function(postResponse) {
									oSelectedRecord.sapInvoice = postResponse.UpdOcrHdrToOcrItm.results[0].Sapinvoice;
									oBindingModel.refresh(true);
									if(oSelectedRecord.sapInvoice && oSelectedRecord.sapInvoice !== "") {
										MessageBox.success(
											"Document no. " + oSelectedRecord.sapInvoice + " posted successfully",
											{
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(sAction) {
													oBindingModel.getData().splice(sPath.split("/")[1], 1);
													oBindingModel.refresh(true);
													
													documentServices.getInstance().getPostedDocuments(this);
												}
											}
										);
									} else {
										MessageBox.error("Error while posting the document");
									}
									oSource.setBusy(false);
								},
								fnError: function (oError) {
									oSource.setBusy(false);
								}
							});
					});
				
				/*source.setBusy(true);
				var reviewedData = JSON.parse(JSON.stringify(selectedRecord));
				
				
				$.ajax("http://localhost:8090/OcrRestSpring/getTaxRate/"+ reviewedData.VendorCountry + "/" + reviewedData.Companycode + "/", {
					success: function(data) {
						console.log(data);
						var tax = (parseFloat(reviewedData.Netvalue) * parseFloat(data.taxRate)) / 100;
						reviewedData.UpdOcrHdrToOcrItm = reviewedData.GetOcrHdrToOcrItm;
				
						for(var i = 0; i < reviewedData.UpdOcrHdrToOcrItm.results.length; i++) {
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
			   });*/	
			} catch (ex) {
				//console.log(ex);
			}
		},
		
		handleNav: function(oEvent) {
			var route = oEvent.getSource().data("route");
			this.getRouter().navTo(route);
		}
	});
});