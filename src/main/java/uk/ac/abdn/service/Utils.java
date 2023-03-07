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

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import uk.ac.abdn.knowledgebase.EmbeddedModel;

public class Utils {
	
	public static void executeQueriesFromCSV (Model model,String payload, EmbeddedModel semModel)  {
		
		String prefixes = "PREFIX peco: <https://w3id.org/peco#> PREFIX ecfo: <https://w3id.org/ecfo#>  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX dash:<https://w3id.org/shp#> PREFIX prov:<http://www.w3.org/ns/prov#>"; 
		
		
		
		ResourceLoader resourceLoader = new DefaultResourceLoader();
		Resource queriesFile = resourceLoader.getResource("/query/queries.csv");
		
		
		//Resource peco = resourceLoader.getResource("/data/peco.ttl");
		Resource ecfo = resourceLoader.getResource("/data/ecfo.ttl");
		
		Reader reader;
		//System.out.println(payload);
		
				
	
			
			
		
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
	
	 
	
}
