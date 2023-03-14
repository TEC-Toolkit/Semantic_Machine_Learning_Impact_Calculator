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
		
	
		@CrossOrigin(origins = "*")
		@PostMapping("/evaluateTrace")
		@ResponseBody
		public String evaluateTrace( @RequestBody String payload, Model model) {
			
			EmbeddedModel semModel = new EmbeddedModel ();  
			
			Utils.executeQueriesFromCSV (model,payload,semModel);
			
			
			//validate GRAPH
			

			//validate if all dataresources defined in the linkage plan were also used in data selection activities
			ArrayList <HashMap <String,String>> result = (ArrayList<HashMap<String, String>>) model.getAttribute("Q1");
			
			
		    Gson gson = new Gson(); 
		    
		    System.out.println(gson.toJson(result));
			//return gson.toJson(result);
		    return "{\"validity\":\"Some of the conversion factors are out of date.\"}";
		
		}
		
		@GetMapping("/cf_info")
		public String cf_info( @RequestParam String cf_iri) {
			
			EmbeddedModel semModel = new EmbeddedModel ();  
		    Gson gson = new Gson(); 
			return gson.toJson(	Utils.getCFInfo (cf_iri,semModel));
		    
		
		}
		
		@GetMapping("/cf_info_alternative_electricity")
		public String cf_info_alternative( @RequestParam String region) {
			
			EmbeddedModel semModel = new EmbeddedModel ();  
		    Gson gson = new Gson(); 
			return gson.toJson(	Utils.getCFInfo_Alternative (region,semModel));
		    
		
		}
		
		
		
		
		
		
		
		
	}

