package uk.ac.abdn.knowledgebase;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

public class CsvParser {
	int possition = 0;

	 public CsvParser (int possition)  
	    {
		 this.possition = possition;
	        //Get scanner instance
	       
	    
	    
	    }
	
     public ArrayList <String> getResutsAsArrayList (String file) throws FileNotFoundException {
    	 ArrayList <String> results = new ArrayList <String> () ; 
    	 String line = "";
         String cvsSplitBy = ",";

         try (BufferedReader br = new BufferedReader(new FileReader(file))) {

             while ((line = br.readLine()) != null) {

                 // use comma as separator
                 String[] items = line.split(cvsSplitBy);

                 results.add(items[possition]);

             }

         } catch (IOException e) {
             e.printStackTrace();
         }
    	 
    	 
    	 
    	 
	        System.out.println("ArrayList size" + results.size());
	        //Do not forget to close the scanner 
	       
    	 return results;
     }
}
