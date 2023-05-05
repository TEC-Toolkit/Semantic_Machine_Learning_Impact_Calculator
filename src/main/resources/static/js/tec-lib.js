

var  dataPrefix =  "https://github.com/mlco2/impact/provenance/i/";
var  eoPrefix =  "https://w3id.org/okn/o/eo#";


/**
 * from stack overflow https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
 * @returns unique uuid
 */
  function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }

  function simplifyGraph (garaphObj) {
  	
	  let newGraph = {};  
	  return newGraph;
  }

function removeLiteralType (stringValue) {
	 if (stringValue) {
	 return	 stringValue.split("^")[0].split("@")[0];
	 } 
	 else {
		return "no value";
	}
}

function generateJsonLDstring (graphLD) {
	
	let jsonld = {};
	jsonld ['@context'] = context;
	jsonld ['@graph'] = graphLD;
	
	return JSON.stringify(jsonld); 
}

function generateJsonObject (graphLD) {
	
	let jsonld = {};
	jsonld ['@context'] = context;
	jsonld ['@graph'] = graphLD;
	
	return jsonld; 
}




function createObservation (agentIRI, observationLabel, emisisonGenerationActivityLabel, foiLabel, locationIRI,  graphLD) {
	
	 
	let activity = {}; 
	
	activity ['@id'] = dataPrefix +"Observation/"+ uuidv4();
	activity ['@type'] = [];
	activity ['@type'].push (context.namedIndividual);
	activity ['@type'].push (context.Activity);
	activity ['@type'].push (context.Observation);
	activity ['wasAssociatedWith'] =[];
	activity ['hasFeatureOfInterest'] =[];
	if (agentIRI!=null) {
		activity ['wasAssociatedWith'].push (agentIRI);
		activity ['madeBySensor'] = agentIRI;
	}
	if (observationLabel!=null) {
		activity ['label'] = observationLabel;
	}
	
	
	let emissionGenerationActivity = {}; 
	
	emissionGenerationActivity ['@id'] = dataPrefix +"EmissionGenerationActivity/"+ uuidv4();
	emissionGenerationActivity ['@type'] = [];
	emissionGenerationActivity ['@type'].push (context.namedIndividual);
	emissionGenerationActivity ['@type'].push (context.Activity);
	emissionGenerationActivity ['@type'].push (context.EmissionGenerationActivity);
	emissionGenerationActivity['hasEmissionScore'] = []
	if (emisisonGenerationActivityLabel!=null) {
		emissionGenerationActivity ['label'] = emisisonGenerationActivityLabel;
	}
	emissionGenerationActivity ['atLocation'] = locationIRI;
	
	activity ['inEmissionActivityContext'] =emissionGenerationActivity ['@id'];
	
	
	let foi = {}; 
	
	foi ['@id'] = dataPrefix +"FeatureOfInterest/"+ uuidv4();
	foi ['@type'] = [];
	foi ['@type'].push (context.namedIndividual);
	foi ['@type'].push (context.Entity);
	foi ['@type'].push (context.FeatureOfInterest);
	if (foiLabel!=null) {
		foi ['label'] = foiLabel;
	}
	activity ['hasFeatureOfInterest'].push(foi ['@id']);
	
	graphLD.push(activity);
	graphLD.push(emissionGenerationActivity);
	graphLD.push(foi);
	
	return activity ['@id'];
}


function createObservationResult (label, value,unitIRI,quantityKindIRI, graphLD) {
	
	let IRI = dataPrefix + "CalculationEntity/ObservationResult/" + uuidv4();
	let input = {}; 
	
	input ['@id'] = IRI;
	input ['@type'] = [];
	input ['@type'].push (context.namedIndividual);
	input ['@type'].push (context.EmissionCalculationEntity);
	input ['@type'].push (context.Quantity);
	input ['@type'].push (context.Result);
	input ['label']= label;
	input ['qudt_value']= value;
	
	let unit = {}; 
	unit ['@id'] = unitIRI;
	unit ['@type'] = [];
	unit ['@type'].push (context.namedIndividual);
	unit ['@type'].push (context.Unit);	
	input ['unit']= unit['@id'];
	
	let quantityKind = {}; 
	quantityKind ['@id'] = quantityKindIRI;
    quantityKind ['@type'] = [];
	quantityKind ['@type'].push (context.namedIndividual);
	quantityKind ['@type'].push (context.QuantityKind);	
	input ['hasQuantityKind']= quantityKind ['@id'] ;
	
	
	
	graphLD.push(input);
	graphLD.push(unit);
	graphLD.push(quantityKind);
	
	
	return IRI;
}



function createCalculationEntity (label, value,unitIRI,quantityKindIRI, graphLD) {
	
	let IRI = dataPrefix + "CalculationEntity/" +  uuidv4();
	let input = {}; 
	
	input ['@id'] = IRI;
	input ['@type'] = [];
	input ['@type'].push (context.namedIndividual);
	input ['@type'].push (context.EmissionCalculationEntity);
	input ['@type'].push (context.Quantity);
	input ['label']= label;
	input ['qudt_value']= {"@value":value,"@type":"xsd:float"};
	
	let unit = {}; 
	unit ['@id'] = unitIRI;
	unit ['@type'] = [];
	unit ['@type'].push (context.namedIndividual);
	unit ['@type'].push (context.Unit);	
	input ['unit']= unit['@id'];
	
	let quantityKind = {}; 
	quantityKind ['@id'] = quantityKindIRI;
    quantityKind ['@type'] = [];
	quantityKind ['@type'].push (context.namedIndividual);
	quantityKind ['@type'].push (context.QuantityKind);	
	input ['hasQuantityKind']= quantityKind ['@id'] ;
	
	
	
	graphLD.push(input);
	graphLD.push(unit);
	graphLD.push(quantityKind);
	
	
	return IRI;
}

function createEmissionScoreEntity (label, value,unitIRI,quantityKindIRI, graphLD) {
	
	let IRI = dataPrefix + "CalculationEntity/" +  uuidv4();
	let input = {}; 
	
	input ['@id'] = IRI;
	input ['@type'] = [];
	input ['@type'].push (context.namedIndividual);
	input ['@type'].push (context.EmissionCalculationEntity);
	input ['@type'].push (context.EmissionScore);
	input ['@type'].push (context.Quantity);
	input ['label']= label;
	input ['qudt_value']= {"@value":value,"@type":"xsd:float"};
	
	let unit = {}; 
	unit ['@id'] = unitIRI;
	unit ['@type'] = [];
	unit ['@type'].push (context.namedIndividual);
	unit ['@type'].push (context.Unit);	
	input ['unit']= unit['@id'];
	
	let quantityKind = {}; 
	quantityKind ['@id'] = quantityKindIRI;
    quantityKind ['@type'] = [];
	quantityKind ['@type'].push (context.namedIndividual);
	quantityKind ['@type'].push (context.QuantityKind);	
	input ['hasQuantityKind']= quantityKind ['@id'] ;
	
	
	
	graphLD.push(input);
	graphLD.push(unit);
	graphLD.push(quantityKind);
	
	
	return IRI;
}

function createCalculationActivity (agentIRI, label, graphLD) {
	
	let IRI = dataPrefix + uuidv4();
	let activity = {}; 
	
	activity ['@id'] = IRI;
	activity ['@type'] = [];
	activity ['@type'].push (context.namedIndividual);
	activity ['@type'].push (context.Activity);
	activity ['@type'].push (context.EmissionCalculationActivity);
	if (agentIRI!=null) {
		activity ['wasAssociatedWith'] = [];
		activity ['wasAssociatedWith'].push (agentIRI);
	}
	if (label!=null) {
		activity ['label'] = label;
	}
	
	graphLD.push(activity);
	
	return activity ['@id'];
}



function linkResultToObservation (resultID,observationID,graphLD) {

	graphLD.forEach (function (observation) {
		if (observation['@id']=== observationID ) {
			if (observation['hasResult'] == null) {
			  observation['hasResult']= [];
			  observation['hasResult'].push( resultID);
		    }
			else {
				observation['hasResult'].push( resultID);
			}
		}
	})

}


function linkInputEntityToActivity (entityID,activityID,graphLD) {

	graphLD.forEach (function (activity) {
		if (activity['@id']=== activityID ) {
			if (activity['used'] == null) {
			  activity['used']= [];
			  activity['used'].push( entityID);
		    }
			else {
				activity['used'].push( entityID);
			}
		}
	})

}

function linkOutputEntityToActivity (entityID,ActivityID,graphLD) {
	graphLD.forEach (function (entity) {
		if (entity['@id']=== entityID ) {
			if (entity['wasGeneratedBy'] == null) {
			  entity['wasGeneratedBy']= [];
			  entity['wasGeneratedBy'].push( ActivityID);
		    }
			else {
				entity['wasGeneratedBy'].push( ActivityID);
			}
		}
	})

}


function linkEmissionScoreToEmissionGenerationActivity (EmissionScoreID,graphLD) {
	graphLD.forEach (function (entity) {
		if (entity['@type'].includes(context.EmissionGenerationActivity) ) {
			  
				entity['hasEmissionScore'].push( EmissionScoreID);
			
		}
	})

}
