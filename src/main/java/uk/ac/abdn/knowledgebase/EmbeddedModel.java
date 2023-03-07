package uk.ac.abdn.knowledgebase;




import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;

import org.apache.jena.rdf.model.ModelFactory;

public class EmbeddedModel {

	OntModel model ;
	
	public EmbeddedModel () {	
		
		
		 model = ModelFactory.createOntologyModel (OntModelSpec.RDFS_MEM_RDFS_INF);
	}
	

	public OntModel getModel() {
		return model;
	}
	
	public void loadData (String dataPath ) {    
		 model.read(dataPath);
		 
	}
	
	
}