package uk.ac.abdn.service;



import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import uk.ac.abdn.knowledgebase.CsvParser;
import uk.ac.abdn.knowledgebase.EmbeddedModel;



	@org.springframework.stereotype.Controller
	
	@RestController
	public class Controller {
		 
		EmbeddedModel semModel = new EmbeddedModel ();  
	
		 @Autowired
		    public void setUpKG() {
			 ResourceLoader resourceLoader = new DefaultResourceLoader();
			 Resource conversion_factors_kg_ml = resourceLoader.getResource("/data/ml_calculator.ttl");
			 Resource conversion_factors_kg = resourceLoader.getResource("/data/cf_2021.ttl");
			 Resource conversion_factors_kg2 = resourceLoader.getResource("/data/cf_2022.ttl");
			 Resource conversion_factors_kg3 = resourceLoader.getResource("/data/cf_2020.ttl");
			 Resource conversion_factors_kg4 = resourceLoader.getResource("/data/cf_2019.ttl");
			 Resource conversion_factors_kg5 = resourceLoader.getResource("/data/cf_2018.ttl");
			 Resource conversion_factors_kg6 = resourceLoader.getResource("/data/cf_2017.ttl");
			 Resource conversion_factors_kg7 = resourceLoader.getResource("/data/cf_2016.ttl");
			 try {
					semModel.loadData(conversion_factors_kg.getFile().getPath());
					semModel.loadData(conversion_factors_kg_ml.getFile().getPath());
					semModel.loadData(conversion_factors_kg2.getFile().getPath());
					semModel.loadData(conversion_factors_kg3.getFile().getPath());
					semModel.loadData(conversion_factors_kg4.getFile().getPath());
					semModel.loadData(conversion_factors_kg5.getFile().getPath());
					semModel.loadData(conversion_factors_kg6.getFile().getPath());
					semModel.loadData(conversion_factors_kg7.getFile().getPath());
					semModel.getModel().read("https://qudt.org/vocab/unit/");
					semModel.getModel().read("https://tec-toolkit.github.io/PECO/release/0.0.1/ontology.ttl");
					semModel.getModel().read("https://tec-toolkit.github.io/ECFO/release/0.0.1/ontology.ttl");
				} catch (IOException e2) {
					// TODO Auto-generated catch block
					e2.printStackTrace();
				}
		    }
		
		
		@CrossOrigin(origins = "*")
		@PostMapping("/evaluateTrace")
		@ResponseBody
		public String evaluateTrace( @RequestBody String payload, Model model) {
			
			 
			
			Utils.executeQueriesFromCSV (model,payload,semModel);
			//Utils.executeSHACL (payload,semModel);
			
			//validate GRAPH
			

			//validate if all dataresources defined in the linkage plan were also used in data selection activities
			ArrayList <HashMap <String,String>> result = (ArrayList<HashMap<String, String>>) model.getAttribute("CF-Out-Of-Date-Violation");
			
			
		    Gson gson = new Gson(); 
		    System.out.println("-----------------------------------------");
		    System.out.println(gson.toJson(model));
			return gson.toJson(model);
		   // return "{\"validity\":\"Some of the conversion factors are out of date.\"}";
		
		}
		
		@PostMapping("/getDataTransformations")
		@ResponseBody
		public String getDatatTransformations( @RequestBody String payload) {		
			
			  ArrayList <HashMap <String,String>> result = Utils.getDatatTransformations (payload,semModel);
		      Gson gson = new Gson(); 
			return gson.toJson(result);
		    
		
		}
		
		@GetMapping("/cf_info")
		public String cf_info( @RequestParam String cf_iri) {
			
			//EmbeddedModel semModel = new EmbeddedModel ();  
		    Gson gson = new Gson(); 
			return gson.toJson(	Utils.getCFInfo (cf_iri,semModel));

		}
		
		@GetMapping("/get_CF")
		public String get_CF( @RequestParam String providerName, @RequestParam String region) {
			
			
		    Gson gson = new Gson(); 
			return gson.toJson(	Utils.getCF_For_Provider_Region (providerName,region,semModel));

		}
		
		@GetMapping("/cf_info_all")
		public String cf_info_alternative( @RequestParam String region) {
			
			
		    Gson gson = new Gson(); 
			return gson.toJson(	Utils.getCFInfo_All (region,semModel));
		    
		
		}
		
		
		
		
		
		
		
		
	}

