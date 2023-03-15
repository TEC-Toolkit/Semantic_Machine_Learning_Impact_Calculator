package uk.ac.abdn.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFParser;
import org.apache.jena.riot.system.ErrorHandlerFactory;
import org.apache.jena.sparql.util.Context;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.Model;

import com.google.gson.JsonElement;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import uk.ac.abdn.knowledgebase.EmbeddedModel;

public class Utils {
	
	static String prefixes = "PREFIX time: <http://www.w3.org/2006/time#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX peco: <https://w3id.org/peco#> PREFIX ecfo: <https://w3id.org/ecfo#>  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX dash:<https://w3id.org/shp#> PREFIX prov:<http://www.w3.org/ns/prov#>"; 
	
	
	
	public static void executeQueriesFromCSV (Model model,String payload, EmbeddedModel semModel)  {
		
			
		
		ResourceLoader resourceLoader = new DefaultResourceLoader();
		Resource queriesFile = resourceLoader.getResource("/query/queries.csv");
		
		
		//Resource peco = resourceLoader.getResource("/data/peco.ttl");
		Resource conversion_factors_kg = resourceLoader.getResource("/data/ml_calculator.ttl");
		
		Reader reader;
		//System.out.println(payload);
		
				
		try {
			semModel.loadData(conversion_factors_kg.getFile().getPath());
		} catch (IOException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}
			
			
		
		semModel.getModel().read(new ByteArrayInputStream(payload.getBytes()), null, "JSON-LD");
		//try {
			//semModel.loadData(payload);
			//semModel.loadData(ecfo.getFile().getPath());
		/*} catch (IOException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}     */
	        System.out.println(semModel.getModel().size());
	     
		
		try {
			reader = new InputStreamReader(queriesFile.getInputStream());
			 try (CSVReader csvReader = new CSVReader(reader)) {
		            List<String[]> r = csvReader.readAll();
		            
		            for (int i=0;i<r.size();i++) {
		            	 System.out.println(r.get(i)[1]);
		            	 Query query = QueryFactory.create(prefixes + " "+ r.get(i)[1].replaceAll("\uFEFF", ""));
		            	 System.out.println(query);
		      		     QueryExecution qExe = QueryExecutionFactory.create( query, semModel.getModel());
		      	         ResultSet results = qExe.execSelect();
		      	         System.out.println(r.get(i)[0]);
		      	         
		      	         ArrayList <HashMap <String,String>> list = new ArrayList <HashMap <String,String>> ();
		      	         
		      	         while (results.hasNext()) {
		      	        	QuerySolution sol = results.next();
		      	        	Iterator<String> it = sol.varNames();
		      	        	HashMap <String, String> map = new HashMap <String, String> ();
		      	        	while (it.hasNext()) {
		      	        		String varName = it.next();
		      	        		map.put(varName,parsePrefix( sol.get(varName).toString()));
		      	        	}
		      	        	
		      	        	list.add(map);
		      	         }
		      	        
		      	        
		      	         model.addAttribute(r.get(i)[0], list);
		      	         System.out.println(list);
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

	private static String parsePrefix (String input) {
		String fixPrefix = input.replace("https://w3id.org/shp#", "dash:");
		if (fixPrefix.indexOf("^") > -1 ) {
		 return fixPrefix.substring(0,fixPrefix.indexOf("^"));
		}
		else {
			return fixPrefix;
		}
	}

	public static ArrayList <HashMap <String,String>> getCFInfo(String cf_iri, EmbeddedModel semModel) {
		
		ArrayList <HashMap <String,String>> list =  new ArrayList <HashMap <String,String>> ();
		ResourceLoader resourceLoader = new DefaultResourceLoader();
		 Resource conversion_factors_kg_ml = resourceLoader.getResource("/data/ml_calculator.ttl");
		 Resource conversion_factors_kg = resourceLoader.getResource("/data/cf_2021.ttl");
		 try {
				semModel.loadData(conversion_factors_kg.getFile().getPath());
				semModel.loadData(conversion_factors_kg_ml.getFile().getPath());
			} catch (IOException e2) {
				// TODO Auto-generated catch block
				e2.printStackTrace();
			}
		
		
		 Query query = QueryFactory.create(prefixes + " Select distinct ?id ?sourceUnit ?targetUnit ?source ?value ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd WHERE { ?id a ecfo:EmissionConversionFactor. OPTIONAL {?id ecfo:sourceUnit/rdfs:label ?sourceUnit.} OPTIONAL {?id ecfo:targetUnit/rdfs:label ?targetUnit.} OPTIONAL {?id prov:wasDerivedFrom ?source.} OPTIONAL {?id rdf:value ?value.} OPTIONAL {?id ecfo:hasApplicableLocation ?loc. ?loc rdfs:label ?applicableLocation. } OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasEnd/time:inXSDDate ?applicablePeriodEnd.} OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasBeginning/time:inXSDDate ?applicablePeriodStart.} VALUES ?id { <"+cf_iri+">}  }");
		 System.out.println("Hello");
		 System.out.println(query);
		     QueryExecution qExe = QueryExecutionFactory.create( query, semModel.getModel());
	         ResultSet results = qExe.execSelect();
             
	         while (results.hasNext()) {
	        	QuerySolution sol = results.next();
	        	Iterator<String> it = sol.varNames();
	        	HashMap <String, String> map = new HashMap <String, String> ();
	        	while (it.hasNext()) {
	        		String varName = it.next();
	        		map.put(varName,parsePrefix( sol.get(varName).toString()));
	        	}
	        	
	        	list.add(map);
	         }
	         System.out.println("LIST");
	         System.out.println(semModel.getModel().size());
	         System.out.println(list);
		
		return list; 
	}

	public static ArrayList<HashMap<String, String>> getCFInfo_Alternative(String region, EmbeddedModel semModel) {
		ArrayList <HashMap <String,String>> list =  new ArrayList <HashMap <String,String>> ();
		ResourceLoader resourceLoader = new DefaultResourceLoader();
		Resource conversion_factors_kg = resourceLoader.getResource("/data/cf_2021.ttl");
		Resource conversion_factors_kg_ml = resourceLoader.getResource("/data/ml_calculator.ttl");
		 try {
				semModel.loadData(conversion_factors_kg.getFile().getPath());
				semModel.loadData(conversion_factors_kg_ml.getFile().getPath());
			} catch (IOException e2) {
				// TODO Auto-generated catch block
				e2.printStackTrace();
			}
		
		
		 Query query = QueryFactory.create(prefixes + " Select distinct  ?id ?sourceUnit ?targetUnit ?source ?value ?applicableLocation ?applicablePeriodStart ?applicablePeriodEnd WHERE { ?current a ecfo:EmissionConversionFactor; ecfo:hasApplicableLocation ?currLoc; ecfo:targetUnit/rdfs:label ?targetUnit. ?currLoc rdfs:label \""+region+"\". ?id a ecfo:EmissionConversionFactor; ecfo:hasTag <https://w3id.org/ecfo/i/Electricity%3A%20UK>; ecfo:hasTag <https://w3id.org/ecfo/i/Electricity%20generated> ; ecfo:hasApplicableLocation ?applicableLocation; ecfo:targetUnit/rdfs:label ?targetUnit. ?applicableLocation geo:ehContains ?currLoc. OPTIONAL {?id ecfo:sourceUnit/rdfs:label ?sourceUnit.} OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasBeginning/time:inXSDDate ?applicablePeriodStart.  } OPTIONAL {?id ecfo:hasApplicablePeriod/time:hasEnd/time:inXSDDate ?applicablePeriodEnd.  } OPTIONAL {?id ecfo:targetUnit ?targetUnit.} OPTIONAL {?id prov:wasDerivedFrom ?source.} OPTIONAL {?id rdf:value ?value.}    }");
		// Query query = QueryFactory.create(prefixes + " Select distinct  ?current ?id ?currLoc ?loc ?tarU1 ?tarU2 ?applicableLocation  ?locA WHERE { ?current a ecfo:EmissionConversionFactor; ecfo:hasApplicableLocation ?currLoc; ecfo:targetUnit ?tarU1. ?currLoc rdfs:label \""+region+"\". ?id a ecfo:EmissionConversionFactor; ecfo:hasTag <https://w3id.org/ecfo/i/Electricity%3A%20UK>; ecfo:hasApplicableLocation ?loc;ecfo:targetUnit ?tarU1. ?loc geo:ehContains ?currLoc. }");
		 
		 System.out.println(query);
		     QueryExecution qExe = QueryExecutionFactory.create( query, semModel.getModel());
	         ResultSet results = qExe.execSelect();
             
	         while (results.hasNext()) {
	        	QuerySolution sol = results.next();
	        	Iterator<String> it = sol.varNames();
	        	HashMap <String, String> map = new HashMap <String, String> ();
	        	while (it.hasNext()) {
	        		String varName = it.next();
	        		map.put(varName,parsePrefix( sol.get(varName).toString()));
	        	}
	        	
	        	list.add(map);
	         }
	         System.out.println("LIST");
	         System.out.println(semModel.getModel().size());
	         System.out.println(list);
		
		return list; 
	}
	
	 
	
}
