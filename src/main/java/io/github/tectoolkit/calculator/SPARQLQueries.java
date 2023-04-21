package io.github.tectoolkit.calculator;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFParser;
import org.apache.jena.riot.system.ErrorHandlerFactory;
import org.apache.jena.sparql.util.Context;
import org.apache.jena.util.FileUtils;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.Model;
import com.google.gson.JsonElement;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import io.github.tectoolkit.calculator.Constants;

public class SPARQLQueries {

	public static void executeQueriesFromCSV(Model modelResults, String payload, OntModel semModel) {

		ResourceLoader resourceLoader = new DefaultResourceLoader();
		Resource queriesFile = resourceLoader.getResource("/validation/queries.csv");

		Reader reader;

		OntModel model = ModelFactory.createOntologyModel(OntModelSpec.RDFS_MEM_RDFS_INF);

		model.read(new ByteArrayInputStream(payload.getBytes()), null, "JSON-LD");
		System.out.println("Prov trace model size: " + model.size());
		model.add(semModel);

		try {
			reader = new InputStreamReader(queriesFile.getInputStream());
			try (CSVReader csvReader = new CSVReader(reader)) {
				List<String[]> r = csvReader.readAll();
				System.out.println("Running validation queries");
				for (int i = 0; i < r.size(); i++) {
					System.out.println("Evaluating: " + r.get(i)[1]);
					Query query = QueryFactory.create(Constants.PREFIXES + " " + r.get(i)[1].replaceAll("\uFEFF", ""));
					System.out.println(query);
					QueryExecution qExe = QueryExecutionFactory.create(query, model);
					ResultSet results = qExe.execSelect();

					ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();

					while (results.hasNext()) {
						QuerySolution sol = results.next();
						Iterator<String> it = sol.varNames();
						HashMap<String, String> map = new HashMap<String, String>();
						while (it.hasNext()) {
							String varName = it.next();
							map.put(varName, sol.get(varName).toString());
						}

						list.add(map);
					}

					System.out.println("Result");
					System.out.println(list);
					modelResults.addAttribute(r.get(i)[0], list);

				}

			} catch (IOException | CsvException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

	}

	public static ArrayList<HashMap<String, String>> getCFInfo(String cf_iri, OntModel semModel) {

		ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();

		Query query = QueryFactory.create(Constants.PREFIXES
				+ " Select distinct ?id ?sourceUnit ?targetUnit ?source ?value ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd "
				+ "WHERE { " + "SERVICE " + Constants.CF_ENDPOINT + " " + "{ ?id a ecfo:EmissionConversionFactor. "
				+ "OPTIONAL {?id ecfo:sourceUnit/rdfs:label ?sourceUnit.} "
				+ "OPTIONAL {?id ecfo:targetUnit/rdfs:label ?targetUnit.} "
				+ "OPTIONAL {?id prov:wasDerivedFrom ?source.} " + "OPTIONAL {?id rdf:value ?value.} "
				+ "OPTIONAL {?id ecfo:hasApplicableLocation ?loc. ?loc rdfs:label ?applicableLocation. } "
				+ "OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasEnd/time:inXSDDate ?applicablePeriodEnd.} "
				+ "OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasBeginning/time:inXSDDate ?applicablePeriodStart.}} "
				+ "VALUES ?id { <" + cf_iri + ">}  }");

		QueryExecution qExe = QueryExecutionFactory.create(query);

		ResultSet results = qExe.execSelect();

		while (results.hasNext()) {
			QuerySolution sol = results.next();
			Iterator<String> it = sol.varNames();
			HashMap<String, String> map = new HashMap<String, String>();
			while (it.hasNext()) {
				String varName = it.next();
				map.put(varName, sol.get(varName).toString());
			}

			list.add(map);
		}
		return list;
	}

	public static ArrayList<HashMap<String, String>> getCFInfo_All(String region, OntModel semModel) {

		ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();

		Query query = QueryFactory.create(Constants.PREFIXES
				+ " SELECT DISTINCT  ?id ?sourceUnit ?targetUnit ?source ?value ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd\n"
				+ "WHERE\n" + "  { \n" + " SERVICE " + Constants.CF_ENDPOINT + " {\n"
				+ "    ?id rdf:type ecfo:EmissionConversionFactor; ecfo:targetUnit/rdfs:label \"kg CO2e\". \n"
				+ "    {\n" + "    ?id  ecfo:hasApplicableLocation/rdfs:label  \"" + region + "\".\n" + "    }\n"
				+ "    UNION \n" + "    {\n" + "    ?id  ecfo:hasApplicableLocation/geo:ehContains/rdfs:label \""
				+ region + "\";\n"
				+ "                                                  ecfo:hasTag           <https://w3id.org/ecfo/i/Electricity%3A%20UK> ,                                       <https://w3id.org/ecfo/i/Electricity%20generated>,<https://w3id.org/ecfo/i/UK%20electricity> . \n"
				+ "    }        \n" + "    OPTIONAL\n" + "      { ?id ecfo:hasApplicableLocation ?location }\n"
				+ "    OPTIONAL\n" + "      { ?id ecfo:sourceUnit/rdfs:label ?sourceUnit }\n" + "    OPTIONAL\n"
				+ "      { ?id ecfo:hasApplicablePeriod/time:hasBeginning/time:inXSDDate ?applicablePeriodStart }\n"
				+ "    OPTIONAL\n"
				+ "      { ?id ecfo:hasApplicablePeriod/time:hasEnd/time:inXSDDate ?applicablePeriodEnd }\n"
				+ "    OPTIONAL\n" + "      { ?id  ecfo:targetUnit/rdfs:label  ?targetUnit }\n" + "    OPTIONAL\n"
				+ "      { ?id  prov:wasDerivedFrom  ?source }\n" + "    OPTIONAL\n"
				+ "      { ?id  rdf:value  ?value }\n"

				+ "    Optional {\n" + "        ?location rdfs:label ?locationLabel.\n" + "    }}\n" + "OPTIONAL {\n"
				+ "        SERVICE " + Constants.WikiData_ENDPOINT + " {     \n"
				+ "             ?location rdfs:label ?wikilocationLabel.\n"
				+ "             FILTER (LANG(?wikilocationLabel) = \"en\")\n" + "        }\n" + "    }\n"
				+ "    bind(if(bound(?locationLabel) , ?locationLabel,?wikilocationLabel) as ?applicableLocation)"

				+ "  } ORDER BY DESC(?applicablePeriodEnd)");

		System.out.println("Emission Conversion Factor Query");
		System.out.println(query);

		// having only SPARQL query with two Service parts doesn't work if at least an
		// empy model isn't passed as well - weird...
		QueryExecution qExe = QueryExecutionFactory.create(query, ModelFactory.createOntologyModel(OntModelSpec.RDFS_MEM_RDFS_INF));

		ResultSet results = qExe.execSelect();

		while (results.hasNext()) {
			QuerySolution sol = results.next();
			Iterator<String> it = sol.varNames();
			HashMap<String, String> map = new HashMap<String, String>();
			while (it.hasNext()) {
				String varName = it.next();
				map.put(varName, sol.get(varName).toString());
			}
			list.add(map);
		}
		System.out.println("Result");
		System.out.println(list);

		return list;
	}

	public static ArrayList<HashMap<String, String>> getDatatTransformations(String payload, OntModel semModel) {
		OntModel model = ModelFactory.createOntologyModel(OntModelSpec.RDFS_MEM_RDFS_INF);

		model.read(new ByteArrayInputStream(payload.getBytes()), null, "JSON-LD");
		model.add(semModel);

		ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();

		Query query = QueryFactory.create(Constants.PREFIXES
				+ " SELECT DISTINCT  ?activityLabel ?inputLabel ?inputValue ?inputUnitLabel ?inputQuantityKindL ?outputLabel ?outputValue ?outputUnitLabel  ?outputQuantityKindL  \n"
				+ "WHERE\n" + "  { ?activity  rdf:type   peco:EmissionCalculationActivity ;\n"
				+ "              rdfs:label  ?activityLabel; prov:used ?input.\n" + "    {\n"
				+ "    ?input a peco:EmissionCalculationEntity; rdfs:label ?inputLabel; qudt:value ?inputValue;qudt:hasQuantityKind ?inputQuantityKind; qudt:unit ?inputUnit.\n"
				+ "    Optional {\n" + "        SERVICE "+Constants.CF_ENDPOINT+"\n"
				+ "          { ?inputUnit rdfs:label ?inputUnitLabel }\n" + "        }\n" + "         Optional {\n"
				+ "        ?inputUnit rdfs:label ?inputUnitLabel. \n" + "        }"

				+ "     OPTIONAL {\n" + "        SERVICE " + Constants.WikiData_ENDPOINT + " {     \n"
				+ "             ?inputQuantityKind rdfs:label ?inputQuantityKindL.\n"
				+ "             FILTER (LANG(?inputQuantityKindL) = \"en\")\n" + "        }\n" + "        }\n"
				+ "    }\n" + "    "
						+ "Union\n" + "    {\n"

				+ "       SERVICE " + Constants.CF_ENDPOINT + " {"
				+ "      ?input  rdf:value ?inputValue; ecfo:targetUnit/rdfs:label ?inputUnitLabel.\n"
				+ "}" + "ecfo:EmissionConversionFactor rdfs:label ?inputQuantityKindL,?inputLabel." + "    }\n" + "    \n"
				+ "    ?output a peco:EmissionCalculationEntity; prov:wasGeneratedBy ?activity; rdfs:label ?outputLabel; qudt:value ?outputValue; qudt:hasQuantityKind "
				+ "    ?outputQuantityKind; qudt:unit ?outputUnit.\n" + "    SERVICE " + Constants.CF_ENDPOINT
				+ " { ?outputUnit rdfs:label ?outputUnitLabel} " + "   \n" + "  \n" + "    OPTIONAL {\n"
				+ "        SERVICE " + Constants.WikiData_ENDPOINT + " {     \n"
				+ "             ?outputQuantityKind rdfs:label ?wikiOutputQuantityKindLabel.\n"
				+ "             FILTER (LANG(?wikiOutputQuantityKindLabel) = \"en\")\n" + "        }\n" + "    }\n"
				+ "    OPTIONAL\n" + "      { ?outputQuantityKind  rdfs:label  ?outputQuantityKindLabel }\n"
				+ "    BIND(if(bound(?outputQuantityKindLabel), ?outputQuantityKindLabel, ?wikiOutputQuantityKindLabel) AS ?outputQuantityKindL)\n"
				+ "  }\n" + " ");

		System.out.println("----------------------");
		System.out.println("Provenance Trace Query");
		System.out.println("----------------------");
		System.out.println(query);
		QueryExecution qExe = QueryExecutionFactory.create(query, model);
		ResultSet results = qExe.execSelect();

		while (results.hasNext()) {
			QuerySolution sol = results.next();
			Iterator<String> it = sol.varNames();
			HashMap<String, String> map = new HashMap<String, String>();
			while (it.hasNext()) {
				String varName = it.next();
				map.put(varName, sol.get(varName).toString());
			}

			list.add(map);
		}
		System.out.println("Provenance Trace Query Result");
		System.out.println(list);

		return list;
	}

}
