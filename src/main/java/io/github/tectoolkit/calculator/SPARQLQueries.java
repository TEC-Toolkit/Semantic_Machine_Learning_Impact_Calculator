package io.github.tectoolkit.calculator;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.IOUtils;
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
		System.out.println(payload);
		//model.add(semModel);

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

	public static String getCFInfo(String cf_iri) {

		ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();
/*
		Query query = QueryFactory.create(Constants.PREFIXES
				+ " Select distinct ?id ?sourceUnit ?targetUnit ?source ?value ?emissionTarget ?emissionSource ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd "
				+ "WHERE { " + "SERVICE " + Constants.CF_ENDPOINT + " " + "{ ?id a ecfo:EmissionConversionFactor. "
				+ "OPTIONAL {?id ecfo:hasSourceUnit/rdfs:label ?sourceUnit.} "
				+ "OPTIONAL {?id ecfo:hasTargetUnit/rdfs:label ?targetUnit.} "
				+ "OPTIONAL {?id ecfo:hasEmissionTarget ?emissionTarget.} "
				+ "OPTIONAL {?id ecfo:hasEmissionSource ?emissionSource.} "
				+ "OPTIONAL {?id prov:wasDerivedFrom ?source.} " + "OPTIONAL {?id rdf:value ?value.} "
				+ "OPTIONAL {?id ecfo:hasApplicableLocation ?loc. ?loc rdfs:label ?applicableLocation. } "
				+ "OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasEnd/time:inXSDDate ?applicablePeriodEnd.} "
				+ "OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasBeginning/time:inXSDDate ?applicablePeriodStart.}} "
				+ "VALUES ?id { <" + cf_iri + ">}  }");
*/
		Query query = QueryFactory.create(Constants.PREFIXES
				+"Construct {\n" + 
				"    ?id ?p ?o.\n" + 
				
				"    ?o2 ?p3 ?o3.\n" + 
				"    ?o3 ?p4 ?o4.\n" + 
				"}\n" + 
				"\n" + 
				"Where {\n" + 
			
				"        ?id ?p ?o.\n" + 
				"        Optional {\n" + 
				"        ?id ecfo:hasApplicablePeriod ?o2.\n" + 
				"            ?o2 ?p3 ?o3.\n" + 
				"            ?o3 ?p4 ?o4.\n" + 
				"    }\n" + 
				"    Values ?id {<"+cf_iri+">}\n" + 
				"}");
		QueryExecution qExe = QueryExecution.service(Constants.CF_ENDPOINT_URL).query(query).build();
		org.apache.jena.rdf.model.Model results = qExe.execConstruct();
		
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		PrintStream ps = new PrintStream(baos);
		results.write(ps, "JSON-LD");
		/*

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
		
		*/
		String result = baos.toString();
		ps.flush();
		return result;
		
	}

	public static ArrayList<HashMap<String, String>> getCFInfo_All(String region, OntModel semModel) {

		ArrayList<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();

		Query query = QueryFactory.create(Constants.PREFIXES
				+ "  SELECT DISTINCT  ?id ?sourceUnit ?targetUnit ?source ?value ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd ?emissionTargetSymbol\n" + 
				"WHERE\n" + 
			
				"      { ?id  rdf:type  ecfo:EmissionConversionFactor .\n" + 
				"        ?id ecfo:hasTargetUnit ?targetUnitInst.\n" + 
				"            ?targetUnitInst    rdfs:label \"kilogram\".\n" + 
				"            ?id    ecfo:hasEmissionTarget/rdfs:label ?emissionTargetSymbol " + 
				"          { ?id ecfo:hasApplicableLocation/rdfs:label \""+region+"\" }\n" + 
				"        UNION\n" + 
				"        { \n" + 
				"            ?id (ecfo:hasApplicableLocation/geo:ehContains)/rdfs:label \""+region+"\" .\n" + 
				"            ?id  ecfo:hasScope ecfo:Scope2.\n" + 
				"            ?id ecfo:hasEmissionSource <https://w3id.org/ecfkg/i/Electricity_generated_Electricity_UK>. \n" + 

				"            ?id ecfo:hasEmissionTarget <http://www.wikidata.org/entity/Q1933140>.         \n" + 
				"          }\n" + 
				"         OPTIONAL\n" + 
				"        {?id ecfo:hasSourceUnit ?sourceUnitInst.}\n" + 
				"        \n" + 
				"        OPTIONAL\n" + 
				"          { ?id  ecfo:hasApplicableLocation  ?location }\n" + 
				"        \n" + 
				"        OPTIONAL\n" + 
				"          { ?id (ecfo:hasApplicablePeriod/time:hasBeginning)/time:inXSDDate ?applicablePeriodStart }\n" + 
				"        OPTIONAL\n" + 
				"          { ?id (ecfo:hasApplicablePeriod/time:hasEnd)/time:inXSDDate ?applicablePeriodEnd }\n" + 
				"        \n" + 
				"        OPTIONAL\n" + 
				"          { ?id  prov:wasDerivedFrom  ?source }\n" + 
				"        OPTIONAL\n" + 
				"          { ?id  rdf:value  ?value }\n" + 
			
			
				
				"       OPTIONAL\n" + 
				"          {\n" + 
				"       ?location  rdfs:label  ?applicableLocation\n" + 
		
				"        }   \n" + 
				"        Optional {\n" + 
				"             ?targetUnitInst  qudt:abbreviation  ?targetUnit.\n" + 
				"        }\n" + 
				"        Optional {\n" + 
				"             ?sourceUnitInst  qudt:abbreviation  ?sourceUnit.\n" + 
				"      }\n" + 

			
				"  }\n" + 
				"ORDER BY DESC(?applicablePeriodEnd)");

		System.out.println("Emission Conversion Factor Query");
		System.out.println(query);

		// having only SPARQL query with two Service parts doesn't work if at least an
		// empy model isn't passed as well - weird...
		//QueryExecution qExe = QueryExecutionFactory.create(query, ModelFactory.createOntologyModel(OntModelSpec.RDFS_MEM_RDFS_INF));
		QueryExecution qExe = QueryExecution.service(Constants.CF_ENDPOINT_URL).query(query).build();
		
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
				+ " SELECT DISTINCT  ?activityLabel ?inputLabel   ?inputValue ?inputUnitLabel ?inputQuantityKindL ?outputLabel ?outputValue  ?outputUnitLabel ?outputQuantityKindL\n" + 
				"WHERE\n" + 
				"  { ?activity  rdf:type   peco:EmissionCalculationActivity ;\n" + 
				"              rdfs:label  ?activityLabel ;\n" + 
				"              prov:used   ?input\n" + 
				"      { ?input  rdf:type              peco:EmissionCalculationEntity ;\n" + 
				"                rdfs:label            ?inputLabel ;\n" + 
				"                qudt:value            ?inputValue ;\n" + 
				"                qudt:hasQuantityKind  ?inputQuantityKind ;\n" + 
				"                qudt:unit             ?inputUnit.\n" + 
				"            ?inputUnit  qudt:abbreviation  ?inputUnitLabel.  \n" + 
				"            ?inputQuantityKind rdfs:label  ?inputQuantityKindL.\n" + 
				"             FILTER ( lang(?inputUnitLabel) = \"en\" )\n" + 
				"          }\n" + 
				"     \n" + 
				"    UNION\n" + 
				"     \n" + 
				"          { ?input  rdf:value  ?inputValue .\n" + 
				"            ?input ecfo:hasTargetUnit/qudt:symbol ?inputUnitLabel .\n" + 
				"            ?input ecfo:hasEmissionTarget/rdfs:label ?inputQuantityKindL.\n" + 
				"            ecfo:EmissionConversionFactor rdfs:label ?inputLabel.\n" + 
				"            FILTER ( lang(?inputQuantityKindL) = \"en\" )\n" + 
				"          }\n" + 
				"        \n" + 
				"     \n" + 
				"    ?output  rdf:type              peco:EmissionCalculationEntity ;\n" + 
				"             prov:wasGeneratedBy   ?activity ;\n" + 
				"             rdfs:label            ?outputLabel ;\n" + 
				"             qudt:value            ?outputValue ;\n" + 
				"             qudt:hasQuantityKind  ?outputQuantityKind ;\n" + 
				"             qudt:unit             ?outputUnit\n" + 
				"    OPTIONAL\n" + 
				"          { ?outputUnit  qudt:abbreviation  ?outputUnitLabel\n" + 
				"            FILTER ( lang(?outputUnitLabel) = \"en\" )\n" + 
				"          }\n" + 
				"        OPTIONAL\n" + 
				"          { ?outputQuantityKind\n" + 
				"                      rdfs:label  ?outputQuantityKindL\n" + 
				"          }\n" + 
				"     \n" + 
				"  } ");

		System.out.println("----------------------");
		System.out.println("Provenance Trace Query");
		System.out.println("----------------------");
		System.out.println(query);
		QueryExecution qExe = QueryExecutionFactory.create(query, model);
		System.out.println("Executing Provenance Trace Query");
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
