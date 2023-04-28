var context = {};
var prov_prefix = "http://www.w3.org/ns/prov#"
var peco_prefix = "https://w3id.org/peco#"
var ecfo_prefix = "https://w3id.org/ecfo#"
var qudt_prefix = "http://qudt.org/schema/qudt/"
var sosa_prefix = "http://www.w3.org/ns/sosa/"
var time_prefix = "http://www.w3.org/2006/time#";

//RDF 
context.value = "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"

//rdfs context
context.label = "http://www.w3.org/2000/01/rdf-schema#label";
context.comment = "http://www.w3.org/2000/01/rdf-schema#comment";

//OWL context
context.namedIndividual = "http://www.w3.org/2002/07/owl#NamedIndividual";

//PROV context
context.endedAtTime = {"@id":prov_prefix+"endedAtTime","@type": "http://www.w3.org/2001/XMLSchema#dateTime"}; 
context.startedAtTime = {"@id":prov_prefix+"startedAtTime","@type": "http://www.w3.org/2001/XMLSchema#dateTime"}; 
context.wasAssociatedWith = {"@id":prov_prefix+"wasAssociatedWith","@type": "@id"};
context.wasMemberOf = {"@id":prov_prefix+"wasMemberOf","@type": "@id"}
context.wasGeneratedBy = {"@id":prov_prefix+"wasGeneratedBy","@type": "@id"}
context.wasDerivedFrom = {"@id":prov_prefix+"wasDerivedFrom","@type": "@id"}
context.used = {"@id":prov_prefix+"used","@type": "@id"}
context.Agent = prov_prefix+"Agent";
context.Activity = prov_prefix+"Activity";
context.Entity = prov_prefix+"Activity";

//Qudt
context.Quantity = qudt_prefix+"Quantity";
context.Unit = qudt_prefix+"Unit";
context.QuantityKind = qudt_prefix+"QuantityKind";

context.unit = {"@id":qudt_prefix+"unit","@type": "@id"};
context.hasQuantityKind = {"@id":qudt_prefix+"hasQuantityKind","@type": "@id"};
context.qudt_value = qudt_prefix+"value";

//PECO context
context.EmissionCalculationActivity = peco_prefix+"EmissionCalculationActivity";
context.EmissionScore = peco_prefix+"EmissionScore";
context.EmissionGenerationActivity = peco_prefix+"EmissionGenerationActivity";
context.EmissionCalculationEntity = peco_prefix+"EmissionCalculationEntity";

context.publisher = {"@id":peco_prefix+"publisher","@type": "http://www.w3.org/2001/XMLSchema#string"};

context.applicableLocation = {"@id":peco_prefix+"applicableLocation","@type": "http://www.w3.org/2001/XMLSchema#string"};
context.targetUnit = {"@id":peco_prefix+"scope","@type": "@id"};
context.sourceUnit = {"@id":peco_prefix+"applicableLocation","@type": "@id"};

context.inEmissionActivityContext = {"@id":peco_prefix+"inEmissionActivityContext","@type": "@id"};

//ECFO context
context.Cf = ecfo_prefix+"EmissionConversionFactor";
context.hasScope = {"@id":peco_prefix+"scope","@type": "@id"};
context.hasApplicableLocation = {"@id":ecfo_prefix+"hasApplicableLocation","@type": "@id"};
context.hasApplicablePeriod = {"@id":ecfo_prefix+"hasApplicablePeriod","@type": "@id"};
context.hasEmissionSource = {"@id":ecfo_prefix+"hasEmissionSource","@type": "@id"};
context.hasEmissionTarget = {"@id":ecfo_prefix+"hasEmissionTarget","@type": "@id"};
context.hasSourceUnit = {"@id":ecfo_prefix+"hasSourceUnit","@type": "@id"};
context.hasTargetUnit = {"@id":ecfo_prefix+"hasTargetUnit","@type": "@id"};
context.hasTag = {"@id":ecfo_prefix+"hasTag","@type": "@id"};

//time 
context.inXSDDate = {"@id":time_prefix+"inXSDDate","@type": "http://www.w3.org/2001/XMLSchema#dateTime"}; 
context.hasBeginning = {"@id":time_prefix+"hasBeginning","@type": "@id"};
context.hasEnd = {"@id":time_prefix+"hasEnd","@type": "@id"};

//SOSA context
context.Observation = sosa_prefix+"Observation";
context.Sensor = sosa_prefix+"Sensor";
context.Result = sosa_prefix+"Result";
context.FeatureOfInterest = sosa_prefix+"FeatureOfInterest";
context.madeBySensor = {"@id":sosa_prefix+"madeBySensor","@type": "@id"};
context.hasFeatureOfInterest = {"@id":sosa_prefix+"hasFeatureOfInterest","@type": "@id"};
context.hasResult = {"@id":sosa_prefix+"hasResult","@type": "@id"};

context.qudt = "http://qudt.org/schema/qudt/";
context.owl  =  "http://www.w3.org/2002/07/owl#";
context.xsd  = "http://www.w3.org/2001/XMLSchema#";
context.ecfo =  "https://w3id.org/ecfo#";
context.rdfs =  "http://www.w3.org/2000/01/rdf-schema#";
context.rdf  =  "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
context.peco =  "https://w3id.org/peco#";
context.time  =  "http://www.w3.org/2006/time#";
context.prov  = "http://www.w3.org/ns/prov#";
