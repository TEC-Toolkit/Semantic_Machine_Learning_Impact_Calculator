var state;
var FEATURES = ["gpu", "provider", "region", "hours"];
var graphLD;

function downloadProvenanceTrace(filename) {
	const blob = new Blob([generateJsonLDstring(graphLD)], { type: 'application/json' });
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	}
	else {
		const elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectAndCopyText(containerid) {
	if (document.selection) { // IE
		var range = document.body.createTextRange();
		range.moveToElementText(document.getElementById(containerid));
		range.select();
		document.execCommand('copy');
	} else if (window.getSelection) {
		var range = document.createRange();
		range.selectNode(document.getElementById(containerid));
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand('copy');
	}
}

function findGetParameter(parameterName) {
	var result = null, tmp = [];
	location.search
		.substr(1)
		.split("&")
		.forEach(function(item) {
			tmp = item.split("=");
			if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
		});
	return result;
}

function insertParam(kvp, key, value) {
	key = encodeURI(key); value = encodeURI(value);
	var i = kvp.length; var x; while (i--) {
		x = kvp[i].split('=');

		if (x[0] == key) {
			x[1] = value;
			kvp[i] = x.join('=');
			break;
		}
	}
	if (i < 0) { kvp[kvp.length] = [key, value].join('='); }
	return kvp
}

function sc(id) {
	$('html,body').animate({
		scrollTop: $("#" + id).offset().top - parseInt($("#" + id).height() / 1.2)
	}, 'slow');
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
//                                              FORM HANDLING
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

const setImports = (serveFrom, elType, attr) => {
	const isDev = serveFrom === "dev";
	$(elType).each((i, el) => {
		let val = $(el).attr(attr);
		if (val && val.indexOf("...") >= 0) {
			$(el).attr(attr, isDev ? val.split("...")[1] : "/impact" + val.split("...")[1])
		}
	})
}


const getValues = () => {
	const gpu = $("#compute-gpu option:selected").val();
	const provider = $("#compute-provider option:selected").val();
	const region = provider !== "custom" ? $("#compute-region option:selected").val() : null;
	const customImpact = provider !== "custom" ? null : parseFloat($("#compute-custom-impact").val());
	const customOffset = provider !== "custom" ? null : parseFloat($("#compute-custom-offset").val());
	const hours = parseFloat($("#compute-hours").val());
	const providerName = $("#compute-provider option:selected").text();
	return {
		gpu, provider, region, hours, customImpact, customOffset, providerName
	}
}


const scrollToBottomResultCard = () => {
	const cardOffset = $("#result-card").offset().top + $("#result-card").outerHeight() - $(window).height() + 50;
	$("html, body").animate({
		scrollTop: cardOffset
	}, 1000, "easeInOutExpo");
	return
}

const growDivOnArrowClick = (clickId, growId) => {
	$(clickId).click(function() {
		if (!$(this).find(".arrow-icon").hasClass("open")) {
			var h = 0;
			$(growId).children().each((k, v) => {
				h += $(v).innerHeight()
			})
			$(growId).height(h);

			setTimeout(() => {
				if ($(window).height() > ($("#result-card").outerHeight() + 150) && !isBottomVisible()) {
					scrollToBottomResultCard()
				}
			}, 500)

		} else {
			$(growId).height(0);
			setTimeout(() => {
				!isBottomVisible(50) && scrollToBottomResultCard();
			}, 500);
		}

		$(this).find(".arrow-icon").toggleClass("open");
	});
}
const growDivOnArrowClickLearn = (clickId, growId) => {
	$(clickId).click(function() {
		if (!$(this).find(".arrow-icon").hasClass("open")) {
			var h = 0;
			$(this).siblings(growId).children().each((k, v) => {
				h += $(v).innerHeight()
			})
			$(this).siblings(growId).height(h);
		} else {
			$(this).siblings(growId).height(0);
		}
		$(this).find(".arrow-icon").toggleClass("open");
	});
}

const check = (type, value) => {
	$("#compute-hours").css("border", "");
	switch (type) {
		case "gpu":
			console.log(state.gpus, value)
			return state.gpus.filter((v, k) => { return v.name === value }).length;
		case "hours":
			return Number.isInteger(value) && value > 0 && value < 1e6;
		case "provider":
			return state.providers.filter((v, k) => { return v.name === value }).length;
		case "region":
			return state.regions.filter((v, k) => { return v.name === value }).length;
		default:
			return true;
	}
}

const checkForm = () => {
	const values = getValues();
	const { gpu, provider, region, hours, providerName } = values;
	let failed = false;

	FEATURES.forEach((v, k) => {
		if (!check(k, v)) {
			fail(k)
			failed = true;
		}
	});
	if (failed) return null

	return values;
}

const twoDigits = n => Number(Number(n).toFixed(2));
const toDigits = (n, d) => Number(Number(n).toFixed(d));

const fillLatexTemplate = (provName, region, hours, gpu, gpuPower, emissions, offsetPercents, impact) => {
	provName ? $("#template-text-offset").show() : $("#template-text-offset").hide();
	$("#template-provider").text(provName || "a private infrastructure");
	$("#template-region").text(region ? ` in region ${region}` : "");
	$("#template-region-efficiency").text(impact);
	$("#template-hours").text(hours);
	$("#template-gpu").text(gpu);
	$("#template-gpu-power").text(gpuPower)
	$("#template-emissions").text(emissions);
	$("#template-percentage-offset").text(offsetPercents);
}

const setDetails = (values) => {

	const { gpu, hours, provider, region, customImpact, customOffset, providerName } = values
	const energy = twoDigits(state.gpus[gpu].watt * hours / 1000); // kWh

	graphLD = [];

	//record provenance of calculation --------- START
	
	let locationIRI = "https://w3id.org/ecfkg/i/mlco2/"+provider+"/"+region
	
	

	let observation = createObservation("https://www.wikidata.org/entity/Q5", "Observe the duration GPU was used for", "ML model training", gpu, locationIRI, graphLD)

	let wattConsumption = createCalculationEntity("Watt Consumption", state.gpus[gpu].watt, "http://www.wikidata.org/entity/Q25236", "http://www.wikidata.org/entity/Q1053879", graphLD, "")
	let durationOfUse = createObservationResult("Duration of Use", hours, "http://www.wikidata.org/entity/Q25235", "http://www.wikidata.org/entity/Q3517751", graphLD, "")
	let energyUsed = createCalculationEntity("Energy Used", energy, "http://www.wikidata.org/entity/Q182098", "http://www.wikidata.org/entity/Q12725", graphLD, "")


	let electricityUseEstimate = createCalculationActivity("https://github.com/TEC-Toolkit/Semantic_Machine_Learning_Impact_Calculator", "Estimate Electricity Use in kW/h", graphLD)

	linkResultToObservation(durationOfUse, observation, graphLD)
	linkInputEntityToActivity(wattConsumption, electricityUseEstimate, graphLD)
	linkInputEntityToActivity(durationOfUse, electricityUseEstimate, graphLD)
	linkOutputEntityToActivity(energyUsed, electricityUseEstimate, graphLD)

	let emissionCalculation = createCalculationActivity("https://github.com/TEC-Toolkit/Semantic_Machine_Learning_Impact_Calculator", "Emission Score Calculation", graphLD)
	linkInputEntityToActivity(energyUsed, emissionCalculation, graphLD)
	//record provenance of calculation --------- END

	console.log("graph")
	console.log(generateJsonLDstring(graphLD))
	console.log(state)




	// const impact = Number.isFinite(customImpact) ? customImpact : twoDigits(state.providers[provider][region].impact / 1000); // kg/kwH
	fetch('/cf_info_all?region=' + region)
		.then((response) =>
			response.json()
		)
		.then((CF_data) => {
			console.log(CF_data)
			if (!CF_data[0].value) {
				alert ("Sorry we could not retrieve Conversion Factor matching this location.")
				
			}
			
			const impact = twoDigits(removeLiteralType(CF_data[0].value));
			const CF_IRI = CF_data[0].id

			console.log(impact)
			console.log(energy)


			const co2 = twoDigits(energy * impact);
			//record provenance of calculation --------- START
			// let CF_IRI = "https://github.com/mlco2/impact/"+provider+"/"+region+"/CF";
			// let conversionFactor = createConversionFactor ("Electricity CF",impact, null,"http://example.com/kgCO2eq",null,state.providers[provider][region].source,null,null,region,graphLD,"" )
			linkInputEntityToActivity(CF_IRI, emissionCalculation, graphLD)

			let emissionScore = createEmissionScoreEntity("Emission Score", co2, "http://www.wikidata.org/entity/Q11570", "http://www.wikidata.org/entity/Q1933140", graphLD, "")
			linkOutputEntityToActivity(emissionScore, emissionCalculation, graphLD)
            linkEmissionScoreToEmissionGenerationActivity (emissionScore, graphLD)
			//record provenance of calculation --------- END
			//display provenance graph
			console.log(graphLD);

			let graph_ld_object = generateJsonObject(graphLD);


			//CHECK THE GRAPH 
            
			//fetch the CF details 
			
			fetch('/cf_info?cf_iri=' + CF_IRI)
			.then((response) =>
				response.json()
			)
			.then((CF_info_ld) => {
				
				console.log (CF_info_ld);
				//add cf details
				if (CF_info_ld['@graph']) {
				graphLD = graphLD.concat(CF_info_ld['@graph'])
				}
				//sometimes "@graph" is not part of the response 
				else {
					delete CF_info_ld['@context'];
					
					graphLD.push(CF_info_ld);
					
				}
               
			fetch('/evaluateTrace', {
				method: 'POST',
				mode: "cors", // no-cors, *cors, same-origin
				body: generateJsonLDstring(graphLD)
				,
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					'Access-Control-Allow-Origin': '*'
				},
			})
				.then((response) =>
					response.json()
				)
				.then((data) => {					
					
					let defaultString = '<div class="alert alert-success" role="alert">No constraints violations were detected</div>'
					
					let resultString = ""; 
					
					if (data["CF-Out-Of-Date-Violation"].length > 0) {
						
						for (i = 0; i < data["CF-Out-Of-Date-Violation"].length; i++) {
							resultString = resultString + '<div class="alert alert-warning" role="alert">Out of Date: The latest Emission conversion factor with value ' + removeLiteralType(data["CF-Out-Of-Date-Violation"][i].cf_value) + ' was valid until  ' + removeLiteralType(data["CF-Out-Of-Date-Violation"][i].time) +' </div>'
						}
						
					}
					
					if (data["CF-No-Source-Violation"].length > 0) {

						for (i = 0; i < data["CF-No-Source-Violation"].length; i++) {
							resultString = resultString + '<div class="alert alert-warning" role="alert">No Source: The Emission conversion factor with value ' + removeLiteralType(data["CF-No-Source-Violation"][i].cf_value) + ' has an unknown source </div>'
						}
						
					}
					
					if (data["CF-No-ApplicablePeriod-Start-Violation"].length > 0) {

						for (i = 0; i < data["CF-No-ApplicablePeriod-Start-Violation"].length; i++) {
							resultString = resultString + '<div class="alert alert-warning" role="alert">No Start: The Emission conversion factor with value ' + removeLiteralType(data["CF-No-ApplicablePeriod-Start-Violation"][i].cf_value) + ' has an unknown start of the applicable period </div>'
						}
						
					}
					
					if (data["CF-No-ApplicablePeriod-End-Violation"].length > 0) {

						for (i = 0; i < data["CF-No-ApplicablePeriod-End-Violation"].length; i++) {
							resultString = resultString + '<div class="alert alert-warning" role="alert">No End: The Emission conversion factor with value ' + removeLiteralType(data["CF-No-ApplicablePeriod-End-Violation"][i].cf_value) + ' has an unknown end of the applicable period </div>'
						}
						
					}
					
					if (resultString.length ==0) {
						document.getElementById('provTraceEval').innerHTML = defaultString
					}
					else {
					document.getElementById('provTraceEval').innerHTML = resultString
					}
				}
				)
				 .catch(function(error) {                        // catch
     alert ("The calcualtor could not evaluate the calculation provenance trace. ");
  });
			///

			// PRINT TRANSFORMATIONS TABLE
			fetch('/getDataTransformations', {
				method: 'POST',
				mode: "cors", // no-cors, *cors, same-origin
				body: generateJsonLDstring(graphLD)
				,
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					'Access-Control-Allow-Origin': '*'
				},
			})
				.then((response) =>
					response.json()
				)
				.then((data) => {

					console.log(data)

					let list = {};

					for (i = 0; i < data.length; i++) {
						list[data[i].activityLabel] = {};
						list[data[i].activityLabel]["input"] = []
						list[data[i].activityLabel]["output"] = []
					}

					for (var prop in list) {
						for (i = 0; i < data.length; i++) {
							if (data[i].activityLabel == prop) {
								let input = data[i].inputLabel + " - " + removeLiteralType(data[i].inputValue) + "" + removeLiteralType(data[i].inputUnitLabel) + " [" + removeLiteralType(data[i].inputQuantityKindL) + "]<hr>"
								list[prop]["input"].push(input);

								let output = data[i].outputLabel + " - " + removeLiteralType(data[i].outputValue) + "" + removeLiteralType(data[i].outputUnitLabel) + " [" + removeLiteralType(data[i].outputQuantityKindL) + "]<hr>"
								if (!list[prop]["output"].includes(output)) {

									list[prop]["output"].push(output);
								}

							}
						}
					}

					let html_string = "";
					for (var prop in list) {

						html_string = html_string + "<tr>"


						html_string = html_string + "<td>" + prop + "</td>"
						html_string = html_string + "<td>";
						for (i = 0; i < list[prop]["input"].length; i++) {
							html_string = html_string + list[prop]["input"][i]
						}
						html_string = html_string + "</td>";

						html_string = html_string + "<td>";
						for (i = 0; i < list[prop]["output"].length; i++) {
							html_string = html_string + list[prop]["output"][i]
						}
						html_string = html_string + "</td>";


						html_string = html_string + "</tr>"



					}
					console.log(html_string)
					let table_body = document.getElementById('data_transformations_table_body');
					table_body.innerHTML = html_string;
				}
				)
						 .catch(function(error) {                        // catch
     alert ("The calcualtor could not retrieve the calculation provenance trace. ");
  });
			
			//end fetch CF details
			})
			///



			//Print CF table


			//document.getElementById('score_value').innerHTML = "<br> for " + energy + "kWh"


			let html_string = "";

			for (i = 0; i < CF_data.length; i++) {
				if (i == 0) {
					html_string = html_string + '<tr style="background-color:#CCF6D3 ;">'
				}
				else {
					html_string = html_string + "<tr>"
				}

				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].sourceUnit) + "</td>"
				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].targetUnit) + "</td>"

				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].applicablePeriodStart) + "</td>"
				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].applicablePeriodEnd) + "</td>"
				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].applicableLocation) + "</td>"



				html_string = html_string + "<td>" + removeLiteralType(CF_data[i].value) + "</td>"


                html_string = html_string + "<td><a href=\"" + CF_data[i].id + "\">link</a></td>"
				
				if (CF_data[i].source) {
				html_string = html_string + "<td><a href=\"" + CF_data[i].source + "\">link</a></td>"
				} else {
					html_string = html_string + "<td>no value</td>"
				}
				
				html_string = html_string + "<td>" + twoDigits(energy * twoDigits(CF_data[i].value.split("^")[0])) + "" + removeLiteralType(CF_data[i].targetUnit) + " ["+removeLiteralType(CF_data[i].emissionTargetSymbol)+"]</td>"
				html_string = html_string + "</tr>"



			}
			console.log(html_string)
			let table_body = document.getElementById('cf_table_body');
			table_body.innerHTML = html_string;





		
			console.log(graph_ld_object);
			$('#graph').empty();
			// d3.jsonldVis(graph_ld_object, '#graph', {  maxLabelWidth: 550 });

			
			
			fillComparisonTable(co2);

			$("#comparison-result-co2").text(co2);
			
			$("#details-counts").html(`
  ${state.gpus[gpu].watt}W x ${hours}h = <strong>${energy} kWh</strong> x ${impact}
  kg  eq. CO<sub>2</sub>/kWh = <strong>${co2} kg eq. CO<sub>2</sub></strong>
  `);
		
			//end first fetch()
		}
		)
		.catch(function(error) {                        // catch
     alert ("The calcualtor could not retrieve the Conversion Factor data from the remote endpoint. ");
     console.log(error)
  });
}

const scientificNotation = (n, d) => {
	const exp = n.toExponential() + "";
	let dec = exp.split(".")[1].split("e")[0];
	dec = dec.slice(0, d);
	const power = exp.split("e")[1];
	let n_d = parseFloat(exp.split(".")[0] + "." + dec);
	if (power === "+0") {
		n_d = toDigits(n_d * 1, d);
	} else if (power === "+1") {
		n_d = toDigits(n_d * 10, d);
	} else if (power === "+2") {
		n_d = toDigits(n_d * 100, d);
	} else if (power === "-1") {
		n_d = toDigits(n_d * 0.1, d);
	} else if (power === "-2") {
		n_d = toDigits(n_d * 0.01, d);
	} else {
		n_d += ` <small>x</small>10<sup>${power.replace("+", "")}</sup>`
	}
	return n_d
}

const fillComparisonTable = co2 => {
	$("#emitted-value").text(co2);
	// https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references

	const DIGITS = 2;
	// # Miles driven by the average passenger vehicle
	// 3.98 x 10-4 metric tons CO2E/mile
	const kgC02PerKm = 3.98 * 1e-4 * 1e3 / 1.609344
	const eqDriven = scientificNotation(co2 / kgC02PerKm, DIGITS);
	// # Pounds of coal burned
	// 9.05 x 10-4 metric tons CO2/pound of coal
	const kgCoalBurnedPerKg = 9.05 * 1e-4 * 1e3 * 2.204623
	const eqCoal = scientificNotation(co2 / kgCoalBurnedPerKg, DIGITS);
	// https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#seedlings
	//  0.060 metric ton CO2 per urban tree planted (sequestered)
	const kgC02SequestratedBySeedling = 0.060 * 1e3
	const eqForest = scientificNotation(co2 / kgC02SequestratedBySeedling, DIGITS);

	$("#comparison-result-driven").html(eqDriven);
	$("#comparison-result-coal").html(eqCoal);
	$("#comparison-result-forest").html(eqForest);
}

const isBottomVisible = _bottomOffset => {
	const bottomOffset = _bottomOffset || 0;
	return $("#result-card").offset().top + $("#result-card").outerHeight() + bottomOffset < ($(window).scrollTop() + $(window).height())
}

const submitCompute = (_values) => {
	$("#result-card").hide();
	$("#comparison-row").hide();
	$("#details-content").height(0);
	$("#details-banner .arrow-icon").removeClass("open")
	$(".spinner-border").show()
	// const values = _values ? _values : checkForm();
	const values = getValues();
	if (!values) return;
	console.log("submit compute called")
	setDetails(values);
	state.current = values

	setTimeout(() => {
		$(".spinner-border").hide()
		$("#result-card").fadeIn();
		$("#comparison-row").fadeIn();
		$("#compute-carbon-emitted-title").height(
			$("#compute-carbon-offset-title").height()
		)

		console.log($(window).scrollTop() + $(window).height());

		if ($(window).width() < 769 || !isBottomVisible()) {
			scrollToBottomResultCard()
		}
	}, getRandomInt(500, 1500)
	)
}


const setRegions = provider => {
	if (provider === "custom") {
		$("#compute-region-div").fadeOut(() => {
			$(".custom-hidable").fadeIn()
		})
	} else {
		if (!$("#compute-region-div").is(":visible")) {
			$(".custom-hidable").fadeOut(() => {
				$("#compute-region-div").fadeIn();
			})
		}
		$("#compute-region").html('');
		let regs = [];
		for (const region in state.providers[provider]) {
			if (state.providers[provider].hasOwnProperty(region) && region !== "__min") {
				let { regionName } = state.providers[provider][region];
				if (!regionName) {
					regionName = region;
				}
				regs.push({ region, regionName })
			}
		}
		regs.sort((a, b) => (
			a.regionName > b.regionName) ? 1 : ((b.regionName > a.regionName) ? -1 : 0)
		);
		for (const reg of regs) {
			const { regionName, region } = reg;
			$("#compute-region").append(`<option value="${region}">${regionName}</option>`)
		}
		//set region for the demo
		 let element = document.getElementById("compute-region");
         element.value = "europe-west2";
	}
}

const setInputs = () => {
	for (const gpuName of Object.keys(state.gpus).sort()) {
		const selected = gpuName === "Tesla V100" ? 'selected' : ''
		$("#compute-gpu").append(`<option ${selected} value="${gpuName}">${gpuName}</option>`)
	}
	let prov;
	let i = 0;
	for (const provider in state.providers) {
		if (i == 0) prov = provider;
		i++;
		if (state.providers.hasOwnProperty(provider)) {
			let providerName;
			for (const region in state.providers[provider]) {
				if (state.providers[provider].hasOwnProperty(region) && region !== "__min") {
					providerName = state.providers[provider][region]["providerName"];
					break;
				}
			}
			$("#compute-provider").append(`<option value="${provider}">${providerName}</option>`)
		}
	}
	
	setRegions(prov)
}


(async function($) {
	"use strict"; // Start of use strict

	// Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: (target.offset().top - 70)
				}, 1000, "easeInOutExpo");
				let w = window.location.pathname;
				if (w[w.length - 1] !== "/") w += "/"
				window.history.pushState('', '', w + this.hash);
				return false;
			}
		}
	});

	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll-trigger').click(function() {
		$('.navbar-collapse').collapse('hide');
	});

	// // Activate scrollspy to add active class to navbar items on scroll
	// $('body').scrollspy({
	//   target: '#mainNav',
	//   offset: 100
	// });
	// $('[data-spy="scroll"]').on('activate.bs.scrollspy', function () {
	//   console.log(this);
	// })

	// lazy load resources as images and iframes
	const observer = lozad();
	observer.observe();

	// Collapse Navbar
	var navbarCollapse = function() {
		if ($("#mainNav").offset().top > 100) {
			$("#mainNav").addClass("navbar-shrink");
		} else {
			$("#mainNav").removeClass("navbar-shrink");
		}
	};
	// Collapse now if page is not at top
	navbarCollapse();
	// Collapse the navbar when page is scrolled
	$(window).scroll(navbarCollapse);



	state = await getData();
	$("#compute-loader").fadeOut(() => {
		$("#compute-container").fadeIn()
	})

	setInputs();
	setImports(serveFrom, "a", "href");
	setImports(serveFrom, "img", "src");
	// $('select').selectize();

	$("#compute-provider").change(e => {
		const provider = $("#compute-provider option:selected").val();
		setRegions(provider)
	})

	$("#compute-submit").click((event) => {
		event.preventDefault()
		console.log("form click called")
		$("#compute-form").submit()
	})

	$("#compute-form").submit(e => {
		console.log("form submit called")
		submitCompute();
		return false;
	})

	// $(".compute-input").change(() => {
	//   $("#compute-submit").prop("disabled", true);
	//   if (checkForm()) $("#compute-submit").prop("disabled", false);
	// })

	$(".details-summary").each((i, el) => {

		if (i % 2 == 0 || $(window).width() < 770) {
			const arrowTemplate = `
      <a class="arrow-icon arrow-learn-even" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `
			$(el).append($(arrowTemplate))
		} else {
			const arrowTemplate = `
      <a class="arrow-icon arrow-learn-odd" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `
			$(el).css("justify-content", "flex-end");
			$(el).prepend($(arrowTemplate))
		}
	});

	growDivOnArrowClickLearn(`.details-summary`, `.summary-content`);
	growDivOnArrowClick("#details-banner", "#details-content");

	// $("#details-featured-maps").click()



	

	


})(jQuery); // End of use strict
