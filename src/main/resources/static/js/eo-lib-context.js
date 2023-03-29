var context = {};
var prov_prefix = "http://www.w3.org/ns/prov#"
var peco_prefix = "https://w3id.org/peco#"
var ecfo_prefix = "https://w3id.org/ecfo#"
var qudt_prefix = "https://qudt.org/schema/qudt/"
var sosa_prefix = "http://www.w3.org/ns/sosa/"

//RDF 
context.rdf_value = {"@id":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","@type": "http://www.w3.org/2001/XMLSchema#string"}

//rdfs context
context.label = "http://www.w3.org/2000/01/rdf-schema#label";
context.comment = "http://www.w3.org/2000/01/rdf-schema#comment";

//OWL context
context.namedIndividual = "http://www.w3.org/2002/07/owl#NamedIndividual";

//PROV context
context.endedAtTime = {"@id":prov_prefix+"endedAtTime","@type": "http://www.w3.org/2001/XMLSchema#dateTime"}; ;
context.startedAtTime = {"@id":prov_prefix+"startedAtTime","@type": "http://www.w3.org/2001/XMLSchema#dateTime"}; 
context.wasAssociatedWith = {"@id":prov_prefix+"wasAssociatedWith","@type": "@id"};
context.wasMemberOf = {"@id":prov_prefix+"wasMemberOf","@type": "@id"}
context.wasGeneratedBy = {"@id":prov_prefix+"wasGeneratedBy","@type": "@id"}
context.wasDerivedFrom = {"@id":prov_prefix+"wasDerivedFrom","@type": "@id"}
context.used = {"@id":prov_prefix+"used","@type": "@id"}
context.value = {"@id":prov_prefix+"value","@type": "http://www.w3.org/2001/XMLSchema#string"}
context.Agent = prov_prefix+"Agent";
context.Activity = prov_prefix+"Activity";

//Qudt
context.Quantity = qudt_prefix+"Quantity";
context.Unit = qudt_prefix+"Unit";
context.QuantityKind = qudt_prefix+"QuantityKind";
context.qudt_value = {"@id":qudt_prefix+"value","@type": "http://www.w3.org/2001/XMLSchema#string"};
context.unit = {"@id":qudt_prefix+"unit","@type": "@id"};
context.hasQuantityKind = {"@id":qudt_prefix+"hasQuantityKind","@type": "@id"};
context.qudt_value = qudt_prefix+"value";

//PECO context
context.EmissionCalculationActivity = peco_prefix+"EmissionCalculationActivity";
context.EmissionGenerationActivity = peco_prefix+"EmissionGenerationActivity";
context.Estimate = peco_prefix+"Estimate";
context.EmissionCalculationEntity = peco_prefix+"EmissionCalculationEntity";
context.Cf = ecfo_prefix+"EmissionConversionFactor";
context.publisher = {"@id":peco_prefix+"publisher","@type": "http://www.w3.org/2001/XMLSchema#string"};
context.scope = {"@id":peco_prefix+"scope","@type": "http://www.w3.org/2001/XMLSchema#string"};
context.applicableLocation = {"@id":peco_prefix+"applicableLocation","@type": "http://www.w3.org/2001/XMLSchema#string"};
context.targetUnit = {"@id":peco_prefix+"scope","@type": "@id"};
context.sourceUnit = {"@id":peco_prefix+"applicableLocation","@type": "@id"};
context.validUntil = {"@id":peco_prefix+"scope","@type": "http://www.w3.org/2001/XMLSchema#dateTime"};
context.validFrom = {"@id":peco_prefix+"applicableLocation","@type": "http://www.w3.org/2001/XMLSchema#dateTime"};

//SOSA context
context.Observation = sosa_prefix+"Observation";
context.Sensor = sosa_prefix+"Sensor";
context.Result = sosa_prefix+"Result";


