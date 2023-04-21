# Semantic Machine Learning Impact Calculator (SMLI)

## Acknowledgemets 

Thsi calculator has been derived from the code published by the <a href="https://github.com/mlco2/impact">Machine Learning's CO2 Impact</a> project

## External Dependencies

The following online resources must be available for the app to work: 

- https://cf.linkeddata.es/sparql

- https://query.wikidata.org/sparql

- https://qudt.org/vocab/unit

- https://tec-toolkit.github.io/PECO/release/0.0.1/ontology.ttl

- https://tec-toolkit.github.io/ECFO/release/0.0.1/ontology.ttl

## Config

Application is set to run on port 8080 by default. To change the default port edit teh port entry in  application.yml 

````
server:
  port : 8080
````

## How to Run

````
git clone  https://github.com/TEC-Toolkit/SemanticMLCalculatorValidationService.git
````

then cd into the project directory and run 

````
mvn spring-boot:run
````

Go to localhost:8080 and you should see the landing page of the Calculator