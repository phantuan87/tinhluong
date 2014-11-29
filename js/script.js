jQuery.noConflict();

var i18n = {
	gross2net_lbl: "GROSS - Thu nhập trước thuế",
	gross2net_desc: "(Tính BHXH, BHYT, BHTN)",
	gross2net_btn: "GROSS -> NET",
	net2gross_lbl: "NET - Thu nhập sau thuế",
	net2gross_btn: "NET -> GROSS",
};

var GROSS_ACT_CAL = "gross2net";
var NET_ACT_CAL = "net2Gross";

var app = (function(jQuery, i18n) {
	
	var currActCal = GROSS_ACT_CAL;
	var config = null;
	
	return {
		numberToMoney: function(val) {
		    return val ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
		},
		moneyToNumber: function(val) {
			val = val || "";
			return parseInt(val.replace(/,/g, ""), 10);
		},
		numberToFloat: function(val) {
			return isNaN(parseFloat(val)) ? 0 : parseFloat(val); 
		},
		calculateSocialInsu: function(bs, sin) {
			return bs * sin / 100;
		},
		calculateHealthInsu: function(bs, hin) {
			return bs * hin / 100; 
		},
		calculateUnempInsu: function(bs, uin) {
			return bs * uin / 100;
		},
		calculateIncomeBe4Tax: function(total, bs, sin, hin, uin) {
			var result = total - (this.calculateSocialInsu(bs, sin) + this.calculateHealthInsu(bs, hin) + this.calculateUnempInsu(bs, uin));
			return result <= 0 ? 0 : result;
		},
		calculateReducDepend: function(redDepend, numDepend) {
			return redDepend * numDepend;
		},
		calculateTaxableIncome: function(redPer, redDepend, numDepend, total, bs, sin, hin, uin) {
			var incomeBe4Tax = this.calculateIncomeBe4Tax(total, bs, sin, hin, uin);
			var reduct = this.calculateReducDepend(redDepend, numDepend);
			return incomeBe4Tax - (redPer + reduct);
		},
		setConfiguration: function(conf) {
			config = conf;
		},
		calculatePerIncomTax: function(taxableIncome) {
	        var pit = config.perIncomeTaxTbl;
			
			if (!pit) {
				console.log("ERROR: Personal Income Tax table is empty");
				return 0;
			}
			
			var perIncomTax = 0;
			for (var prob in pit) {
				if (pit.hasOwnProperty(prob)) {
					lvl = pit[prob];
					
					// Last level.
					if (lvl.to === undefined) {
						lvl["tax"] = (taxableIncome - lvl.from) * lvl.per / 100;
						perIncomTax += lvl["tax"];
						break;
					}
					
					if (taxableIncome > lvl.to) {
						lvl["tax"] = (lvl.to - lvl.from) * lvl.per / 100;
						perIncomTax += lvl["tax"];
					} else {
						lvl["tax"] = (taxableIncome - lvl.from) * lvl.per / 100;
						perIncomTax += lvl["tax"];
						break;
					}
				}
			}
			
			jQuery("#pit_5").html(this.numberToMoney(pit.lv1.tax));
			jQuery("#pit_10").html(this.numberToMoney(pit.lv2.tax));
			jQuery("#pit_15").html(this.numberToMoney(pit.lv3.tax));
			jQuery("#pit_20").html(this.numberToMoney(pit.lv4.tax));
			jQuery("#pit_25").html(this.numberToMoney(pit.lv5.tax));
			jQuery("#pit_30").html(this.numberToMoney(pit.lv6.tax));
			jQuery("#pit_35").html(this.numberToMoney(pit.lv7.tax));
			
			return perIncomTax;
		},
		showAllInput: function() {
			var incomeVND = app.moneyToNumber(jQuery("#income_vnd").val());
	    	var incomeUSD = app.moneyToNumber(jQuery("#income_usd").val());
	    	var income = incomeVND ? incomeVND : incomeUSD;
	    	var exRateUSD = app.moneyToNumber(jQuery("#rate_usd").val());
	    	
	    	var totalIncomeVND = app.moneyToNumber(jQuery("#total_income_vnd").val());
	    	var totalIncomeUSD = app.moneyToNumber(jQuery("#total_income_usd").val());
	    	var totalIncome = totalIncomeVND ? totalIncomeVND : totalIncomeUSD;
	    	
	    	var mWage = app.moneyToNumber(jQuery("#minimum_wage").val());
	    	var sin = jQuery("#social_insurance").val();
	    	var hin = jQuery("#heath_insurance").val();
	    	var uin = jQuery("#unemployed_insurance").val();
	    	
	    	var redPerson = app.moneyToNumber(jQuery('#reduct_personal').val());
			var redDepend = app.moneyToNumber(jQuery("#reduct_dependant").val());
			var numDepend = jQuery("#reduct_numbr_denpendat").val();
			
			console.log("incomeVND: " + incomeVND + " --- "
			+ "incomeUSD: " + incomeUSD + " --- "
			+ "income: " + income + " --- "
			+ "exRateUSD: " + exRateUSD + " --- "
			+ "totalIncomeVND: " + totalIncomeVND + " --- "
			+ "totalIncomeUSD: " + totalIncomeUSD + " --- "
			+ "totalIncome: " + totalIncome + " --- "
			+ "mWage: " + mWage + " --- "
			+ "sin: " + sin + " --- "
			+ "hin: " + hin + " --- "
			+ "uin: " + uin + " --- "
			+ "redPerson: " + redPerson + " --- "
			+ "redDepend: " + redDepend + " --- "
			+ "numDepend: " + numDepend);
		},
		
		showGross2net: function() {
			currActCal = GROSS_ACT_CAL;

			jQuery("#receive_income_lbl").html(i18n.gross2net_lbl);
			jQuery("#receive_income_desc").html(i18n.gross2net_desc);
			jQuery("#gross2net_btn").css("active");
			jQuery("#calculate").html(i18n.gross2net_btn);
		},
		showNet2gross: function() {
			currActCal = NET_ACT_CAL;

			jQuery("#receive_income_lbl").html(i18n.net2gross_lbl);
			jQuery("#receive_income_desc").html("");
			jQuery('#net2gross_btn').css("active");
			jQuery("#calculate").html(i18n.net2gross_btn);
		},
		isGross2Net: function() {
			return currActCal === GROSS_ACT_CAL;
		},
		isNet2Gross: function() {
			return currActCal === GROSS_ACT_CAL;
		}
	};
}(jQuery, i18n));

jQuery(document).ready(function() {
	
	// Apply money format for all money-field when text change
	jQuery(".money-field").each(function() {
		jQuery(this).bind("change", function() {
			var text = jQuery(this).val();
			var money = app.numberToMoney(text);
			jQuery(this).val(money);
		});
	});
	
	// Apply number format for all number-field and percent-field
	// http://stackoverflow.com/questions/995183/how-to-allow-only-numeric-0-9-in-html-inputbox-using-jquery
	jQuery(".money-field, .number-field, .percent-field").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and.
        if (jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1
             // Allow: Ctrl+A
            || (e.keyCode == 65 && e.ctrlKey === true) 
             // Allow: home, end, left, right
            || (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
			return;
        }
        
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) 
				&& (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    
	// Load configuration data.
    jQuery.getJSON('./data/config.json', function(config) {
		
		jQuery("#rate_usd").val(app.numberToMoney(config.exchange_rate));
        jQuery("#rate_usd").val(app.numberToMoney(config.exchange_rate)); // TODO set value when get exchange rate from bank.
        jQuery("#minimum_wage").val(app.numberToMoney(config.minimum_wage));
        jQuery("#social_insurance").val(config.social_ins);
        jQuery("#heath_insurance").val(config.health_ins);
        jQuery("#unemployed_insurance").val(config.unemployed_ins);
        jQuery("#reduct_personal").val(app.numberToMoney(config.reduct_personal));
        jQuery("#reduct_dependant").val(app.numberToMoney(config.reduct_dependant));
        jQuery("#reduct_numbr_denpendat").val(config.reduct_nbr_denp);
        
        // TODO remove after testing.
        jQuery("#bs_income_vnd").val(app.numberToMoney(15000000));
        jQuery("#receive_income_vnd").val(app.numberToMoney(20000000));
        // -----
        
        // Keep configuation.
        app.setConfiguration(config);
        
        // Initilialize GUI
        if (config.default_actCal === GROSS_ACT_CAL) {
			app.showGross2net();
		} else {
			app.showNet2gross();
		}
        
    }).fail(function(jqxhr, textStatus, error) {
    	var err = textStatus + ", " + error;
        console.log( "Load data failed: " + err );
        alert("Load data failed: " + err);
    });
    
    // http://stackoverflow.com/questions/19821753/jquery-xml-error-no-access-control-allow-origin-header-is-present-on-the-req
    // TODO: get exchange rate from bank.
    /*
    jQuery.ajax({
		url: "http://www.vietcombank.com.vn/ExchangeRates/ExrateXML.aspx",
		type: "GET",
		contentType: "application/xml",
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		},
		dataType: "xml",
		success: function (xmlData) {
			var $page = jQuery(xmlData);
			alert($page);
		},
		error: function (xhr, status) {
			alert("error");
		}
	});*/
    
    jQuery("#calculate").click(function() {
    	// Collect all data.
    	var bsIncomeVND = app.moneyToNumber(jQuery("#bs_income_vnd").val());
    	var bsIncomeUSD = app.moneyToNumber(jQuery("#bs_income_usd").val());
    	var exRateUSD = app.moneyToNumber(jQuery("#ex_rate_usd").val());
    	var bsIncome = bsIncomeVND ? bsIncomeVND : bsIncomeUSD; // TODO: change currency VND -> USD.
    	
    	var receiveIncomeVND = app.moneyToNumber(jQuery("#receive_income_vnd").val());
    	var receiveIncomeUSD = app.moneyToNumber(jQuery("#receive_income_usd").val());
    	var receiveIncome = receiveIncomeVND ? receiveIncomeVND : receiveIncomeUSD;
    	
    	var mWage = app.moneyToNumber(jQuery("#minimum_wage").val());
    	var sin = app.numberToFloat(jQuery("#social_insurance").val());
    	var hin = app.numberToFloat(jQuery("#heath_insurance").val());
    	var uin = parseFloat(jQuery("#unemployed_insurance").val()) === "NaN" ? 0 : parseFloat(jQuery("#unemployed_insurance").val());
    	
    	var redPerson = app.moneyToNumber(jQuery('#reduct_personal').val());
		var redDepend = app.moneyToNumber(jQuery("#reduct_dependant").val());
		var numDepend = jQuery("#reduct_numbr_denpendat").val();
		
		var gross = 0;
		var net = 0;
		
		// Calculate data for Income and tax
		var gross = app.isGross2Net() ? receiveIncome : 0;
    	var net = app.isNet2Gross() ? receiveIncome : 0;
		
		var socialInsu = app.calculateSocialInsu(bsIncome, sin);
		var healthInsu = app.calculateHealthInsu(bsIncome, hin);
		var unEmpInsu = app.calculateUnempInsu(bsIncome, uin);
		
		if (app.isGross2Net()) {
			var incomeBe4Tax = app.calculateIncomeBe4Tax(gross, bsIncome, sin, hin, uin);
			var reducDepend = app.calculateReducDepend(redDepend, numDepend);
			var taxableIncome = app.calculateTaxableIncome(redPerson, redDepend, numDepend, gross, bsIncome, sin, hin, uin);
			var perIncomTax = app.calculatePerIncomTax(taxableIncome);
			net = incomeBe4Tax - perIncomTax;
			
			// Summary GROSS-NET
			jQuery("#gross_summary").html(app.numberToMoney(gross));
			jQuery("#net_summary").html(app.numberToMoney(net));
			
			// Summary table
			jQuery("#gross_dt").html(app.numberToMoney(gross));
			jQuery("#sin_dt").html(app.numberToMoney(socialInsu));
			jQuery("#hin_dt").html(app.numberToMoney(healthInsu));
			jQuery("#uin_dt").html(app.numberToMoney(unEmpInsu));
			
			jQuery("#income_be4_tax_dt").html(app.numberToMoney(incomeBe4Tax));
			jQuery("#red_person_dt").html(app.numberToMoney(redPerson));
			jQuery("#red_depen_dt").html(app.numberToMoney(reducDepend));
			jQuery("#tax_income_dt").html(app.numberToMoney(taxableIncome));
			jQuery("#per_tax_income_dt").html(app.numberToMoney(perIncomTax));
			jQuery("#net_dt").html(app.numberToMoney(net));
			
		} else {
			// TODO calculate GROSS
		}
    }); 
    
    jQuery("#gross2net_btn").click(function() {
		app.showGross2net();
	});
	
	jQuery("#net2gross_btn").click(function() {
		app.showNet2gross();
	});

});

