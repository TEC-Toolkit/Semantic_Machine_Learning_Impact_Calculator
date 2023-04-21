package io.github.tectoolkit.calculator;

import java.util.ArrayList;
import java.util.HashMap;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.google.gson.Gson;

@org.springframework.stereotype.Controller

@RestController
public class Controller {

	OntModel semModel;

	@Autowired
	public void setUpKG() {

		semModel = ModelFactory.createOntologyModel(OntModelSpec.RDFS_MEM_RDFS_INF);

		// read some ontologies so we have the labels for units, etc.
		semModel.read(Constants.QUDT_UNITS);
		semModel.read(Constants.ECFO);
		semModel.read(Constants.PECO);
	}

	@PostMapping("/evaluateTrace")
	@ResponseBody
	public String evaluateTrace(@RequestBody String payload, Model model) {

		SPARQLQueries.executeQueriesFromCSV(model, payload, semModel);
		Gson gson = new Gson();
		System.out.println("-----------------------------------------");
		System.out.println(gson.toJson(model));
		return gson.toJson(model);

	}

	@PostMapping("/getDataTransformations")
	@ResponseBody
	public String getDatatTransformations(@RequestBody String payload) {

		ArrayList<HashMap<String, String>> result = SPARQLQueries.getDatatTransformations(payload, semModel);
		Gson gson = new Gson();
		return gson.toJson(result);

	}

	@GetMapping("/cf_info")
	public String cf_info(@RequestParam String cf_iri) {

		Gson gson = new Gson();
		return gson.toJson(SPARQLQueries.getCFInfo(cf_iri, semModel));

	}

	@GetMapping("/cf_info_all")
	public String cf_info_alternative(@RequestParam String region) {

		Gson gson = new Gson();
		return gson.toJson(SPARQLQueries.getCFInfo_All(region, semModel));
	}
}
