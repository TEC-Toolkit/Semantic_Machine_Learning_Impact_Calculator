

  (function() {
    'use strict';


    //need sto be rewritten to be more generic with regex
    function convertPrefix (input) {
	  
  	  console.log(input)
  	  input =input.replace ("http://www.w3.org/2002/07/owl#","owl:")
  	  input =input.replace ("http://www.w3.org/ns/prov#","prov:")
  	  input =input.replace ("https://w3id.org/peco#","peco:")
	  input =input.replace ("https://eats.org/InstanceData/","data:")
	  input =input.replace ("http://qudt.org/2.1/vocab/unit/","qudt_unit:")
	  input =input.replace ("http://example.com/","ex:")
	 input =input.replace (" http://qudt.org/2.1/vocab/quantitykind/","qudt_kind:")
  	  	  console.log(input)
  	  return input;
    }
  

    function jsonldVis(jsonld, selector, config) {
      if (!arguments.length) return jsonldVis;
      config = config || {};

      var h = config.h || 600
        , w = config.w || 800
        , maxLabelWidth = config.maxLabelWidth || 250
        , transitionDuration = config.transitionDuration || 750
        , transitionEase = config.transitionEase || 'cubic-in-out'
        , minRadius = config.minRadius || 5
        , scalingFactor = config.scalingFactor || 2;

      var i = 0;

      var tree = d3.layout.tree()
        .size([h, w]);

      var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

      var svg = d3.select(selector).append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', 'translate(' + maxLabelWidth + ',0)');

      var tip = d3.tip()
        .direction(function(d) {
          return d.children || d._children ? 'w' : 'e';
        })
        .offset(function(d) {
          return d.children || d._children ? [0, -3] : [0, 3];
        })
        .attr('class', 'd3-tip')
        .html(function(d) {
          return '<span>' + d.valueExtended + '</span>';
        });

      svg.call(tip);

     // var root = jsonldTree(jsonld).children[0];
	  var root = jsonldTreeEmissions(jsonld);
	  console.log(root)
      root.x0 = h / 2;
      root.y0 = 0;
      root.children.forEach(collapse);
	  console.log("root")
	  console.log(root)

      function changeSVGWidth(newWidth) {
        if (w !== newWidth) {
          d3.select(selector + ' > svg').attr('width', newWidth);
        }
      }

      
	  function jsonldTreeEmissions(source) {
		  var tree = {};
		  
		  findEmissionScoreRoot(source, tree)
		  
		  return tree;  
      }
	  
	  function findEmissionScoreRoot(source, tree) {
		  let children = [];
		  console.log( source['@graph']);
		  source['@graph'].forEach ( function (element) {
		  	
			  if (element['@type']!=null) {
				  if (element['@type'].includes("https://w3id.org/peco#EmissionCalculationEntity") ) {
				  	 console.log(element['@id'])
					  if (element['unit']!=null) {
					     source['@graph'].forEach ( function (unit) {
					         if (unit['@id'] === element['unit'] ) {
								 console.log(unit['@id'])
					         	if (element['hasQuantityKind']!=null) {
								  source['@graph'].forEach ( function (quantity) {
									  
									    if ((quantity['@id'] === "https://w3id.org/peco#EmissionScore")&&element['hasQuantityKind'] === "https://w3id.org/peco#EmissionScore") {
											console.log("FOUND");
									    tree.isIdNode = true;
										tree.name = element['label'];
									
										
										//add unit to children 
							            children.push({
											name: "Value",
							                value: element['qudt_value']
							            });
										
										//add unit to children 
							            children.push({
											name: "Unit",
							                value: convertPrefix(unit['@id'])
							            });
										
										//add unit to children 
							            children.push({
											name: "Kind",
							                value: convertPrefix(quantity['@id'])
							            });
										
										element['wasGeneratedBy'].forEach (function (el) {
											
											let activity = {}; 
											
											//find the activity object
											source['@graph'].forEach ( function (act) {
												if (act['@id']===el) {
													activity = act;
												}
											})
										
											
											//add activity to children 
								            children.push({
												name: "GeneratedBy",
								                children: [parseActivityTree(activity,source['@graph'])]
								            });
										})
										
										
									}
								        })
								
								}
					         }
					 
					     })
						 
					 }
					 
				  }
			  }
			
		  })
         
		  if (children.length) {
            tree.children = children;
          }
		  
      }

      function parseActivityTree (elementSource,graph) {
		  var tree = {};
		  let children = [];
		  
	
		  tree.isIdNode = true;
		  tree.name = elementSource['label']; 
	    
		  if (elementSource['used'] !=null) {
		    elementSource['used'].forEach (function (el) {
			
			let entity = {}; 
			
			//find the activity object
			graph.forEach ( function (ent) {
				if (ent['@id']===el) {
					entity = ent;
				}
			})
			
            children.push({
				name: "Used",
                children: [parseEntityTree(entity,graph)]
            });
		})
	     }
		 
	  if (children.length) {
           tree.children = children;
         }

		  return tree;	  
	  }
	  
      function parseEntityTree (element,graph) {
		  var tree = {};
		  let children = [];
		  
	
		  tree.isIdNode = true;
		  tree.name = element['label']; 
	    
		  if (element['@type']!=null) {
			  if (element['@type'].includes("https://w3id.org/ecfo#EmissionConversionFactor") ) {
				  console.log(element)
				 
				  let value = ""; 
				  
				  if (element['rdf_value']!=null) {
				      value = element['rdf_value']
				  }
				  else {
					  value = "UNKNOWN";
				  }
					
		            children.push({
						name: "CFValue",
		                value: value
		            });
				 
	  			  if (element['publisher']!=null) {
				      value = element['publisher']
				  }
				  else {
					  value = "UNKNOWN";
				  }
	  				
	  	            children.push({
	  					name: "publisher",
	  	                value: value
	  	            });
	  			 
				 
		  		  if (element['applicableLocation']!=null) {
				      value = element['applicableLocation']
				  }
				  else {
					  value = "UNKNOWN";
				  }
			
		  			
		              children.push({
		  				name: "applicable location",
		                  value: value
		              });
					  
				
				if (element['validUntil']!=null) {
					  value = element['validUntil']
				}
			  else {
				  value = "UNKNOWN";
			  }
		
					
				           children.push({
							name: "valid until",
				               value: value
				           });
						   
				
				if (element['validFrom']!=null) {
					  value = element['validFrom']
				}
			    else {
				  value = "UNKNOWN";
			    }
	
						 	
						           children.push({
						 		name: "valid from",
						               value: value
						           });
						  
				if (element['sourceUnit']!=null) {
					  value = element['sourceUnit']
				}
			    else {
				  value = "UNKNOWN";
			    }

								
								           children.push({
								  	name: "source unit",
								               value: value
								           });
				
				
				if (element['targetUnit']!=null) {
					  value = element['targetUnit']
				}
				 else {
				  value = "UNKNOWN";
				    }

								
				   children.push({
					name: "target unit",
				   value: value
				 });
			    
				if (element['scope']!=null) {
						   value = element['scope']
				}
				else {
					value = "UNKNOWN";
					 }

						   
						     children.push({
						   	name: "scope",
						     value: value
						   });
								  
				 
			  }
		  }
		 
		  if (element['@type']!=null) {
			  if (element['@type'].includes("https://w3id.org/peco#EmissionCalculationEntity") ) {
				  if (element['unit']!=null) {
				     graph.forEach ( function (unit) {
				         if (unit['@id'] === element['unit'] ) {
				         	if (element['hasQuantityKind']!=null) {
							  graph.forEach ( function (quantity) {
								  
								    if (quantity['@id'] === element['hasQuantityKind']) {
										
								    tree.isIdNode = true;
									tree.name = element['label'];
								
									
									//add unit to children 
						            children.push({
										name: "Value",
						                value: element['qudt_value']
						            });
									
									//add unit to children 
						            children.push({
										name: "Unit",
						                value: convertPrefix(unit['@id'])
						            });
									
									//add unit to children 
						            children.push({
										name: "Kind",
						                value: convertPrefix(quantity['@id'])
						            });
									if (element['wasGeneratedBy']!=null) {
									element['wasGeneratedBy'].forEach (function (el) {
										
										let activity = {}; 
										
										//find the activity object
										graph.forEach ( function (act) {
											if (act['@id']===el) {
												activity = act;
											}
										})
									
										
										//add activity to children 
							            children.push({
											name: "GeneratedBy",
							                children: [parseActivityTree(activity,graph)]
							            });
									})
									
								}	
								}
							        })
							
							}
				         }
				 
				     })
					 
				 }
				 
			  }
		  }
		 
		 
		 
	  if (children.length) {
           tree.children = children;
         }

		  return tree;	  
	  }






      function jsonldTree(source) {
        var tree = {};

        if ('@id' in source) {
          tree.isIdNode = true;
		   console.log("source")
		  console.log(Object.keys(source))
          tree.name = convertPrefix(source['@id']);
          if (tree.name.length > maxLabelWidth / 9) {
            tree.valueExtended = tree.name;
            tree.name = '...' + tree.valueExtended.slice(-Math.floor(maxLabelWidth / 9));
          }
        } else {
          tree.isIdNode = true;
          tree.isBlankNode = true;
          // random id, can replace with actual uuid generator if needed
          tree.name = 'provenance trace';
        }
		
		/*
		if ('http://www.w3.org/2000/01/rdf-schema#label' in source) {
			tree.name = convertPrefix(source['@http://www.w3.org/2000/01/rdf-schema#label']);
	    }
		*/
		
		if ('@type' in source) {
			
			//find supported types
			
			tree.name = convertPrefix(source['@type'][0]);
	    }
		
		if ('[object Object]' in source) {
			
			//find supported types
			console.log("here");
			
			
			for (let variable in source) {
				console.log(variable);
				console.log(Object.keys(variable))
			    console.log(variable[Object.keys(variable)[0]])
				console.log(typeof variable);
				if (typeof variable === 'object') {
					console.log(variable['@id']);
					console.log(source[variable]['@id']);
				}
			}
			
			
	    }
		
		
		

        var children = [];
        Object.keys(source).forEach(function(key) {
          if (key === '@id' || key === '@context' || key === '@type' || key === 'http://www.w3.org/2000/01/rdf-schema#label' || source[key] === null) return;

          var valueExtended, value;
          if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
            children.push({
				name: convertPrefix(key),
              children: [jsonldTree(source[key])]
            });
          } else if (Array.isArray(source[key])) {
            children.push({
				name: convertPrefix(key),
              children: source[key].map(function(item) {
                if (typeof item === 'object') {
                  return jsonldTree(item);
                } else {
                  return { name: convertPrefix(item) };
                }
              })
            });
          } else {
            valueExtended = source[key];
            value = valueExtended;
            if (value.length > maxLabelWidth / 9) {
              value = value.slice(0, Math.floor(maxLabelWidth / 9)) + '...';
              children.push({
				  name: convertPrefix(key),
                value: value,
                valueExtended: valueExtended
              });
            } else {
              children.push({
				  name: convertPrefix(key),
                value: value
              });
            }
          }
        });

        if (children.length) {
          tree.children = children;
        }

        return tree;
      }

      function update(source) {
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);

        nodes.forEach(function(d) { d.y = d.depth * maxLabelWidth; });

        var node = svg.selectAll('g.node')
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeEnter = node.enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', function(d) { return 'translate(' + source.y0 + ',' + source.x0 + ')'; })
          .on('click', click);

        nodeEnter.append('circle')
          .attr('r', 0)
          .style('stroke-width', function(d) {
            return d.isIdNode ? '2px' : '1px';
          })
          .style('stroke', function(d) {
            return d.isIdNode ? '#F7CA18' : '#4ECDC4';
          })
          .style('fill', function(d) {
            if (d.isIdNode) {
              return d._children ? '#F5D76E' : 'white';
            } else {
              return d._children ? '#86E2D5' : 'white';
            }
          })
          .on('mouseover', function(d) { if (d.valueExtended) tip.show(d); })
          .on('mouseout', tip.hide);

        nodeEnter.append('text')
	  
	  
          .attr('x', function(d) {
            var spacing = computeRadius(d) + 5;
            return d.children || d._children ? -spacing : spacing;
          })
          .attr('dy', '-15')
		  
          .attr('text-anchor', function(d) { return d.children || d._children  ? 'end' : 'start'; })
          .text(function(d) { return d.name + (d.value ? ': ' + d.value : ''); })
          .style('fill-opacity', 0);

        var maxSpan = Math.max.apply(Math, nodes.map(function(d) { return d.y + maxLabelWidth; }));
        if (maxSpan + maxLabelWidth + 20 > w) {
          changeSVGWidth(maxSpan + maxLabelWidth);
          d3.select(selector).node().scrollLeft = source.y0;
        }

        var nodeUpdate = node.transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

        nodeUpdate.select('circle')
          .attr('r', function(d) { return computeRadius(d); })
          .style('stroke-width', function(d) {
            return d.isIdNode ? '2px' : '1px';
          })
          .style('stroke', function(d) {
            return d.isIdNode ? '#F7CA18' : '#4ECDC4';
          })
          .style('fill', function(d) {
            if (d.isIdNode) {
              return d._children ? '#F5D76E' : 'white';
            } else {
              return d._children ? '#86E2D5' : 'white';
            }
          });

        nodeUpdate.select('text').style('fill-opacity', 1);

        var nodeExit = node.exit().transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')'; })
          .remove();

        nodeExit.select('circle').attr('r', 0);
        nodeExit.select('text').style('fill-opacity', 0);

        var link = svg.selectAll('path.link')
          .data(links, function(d) { return d.target.id; });

        link.enter().insert('path', 'g')
          .attr('class', 'link')
		  .attr("fill", "none")
		  .attr("stroke", "black")
          .attr('d', function(d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
          });

        link.transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('d', diagonal);

        link.exit().transition()
          .duration(transitionDuration)
          .ease(transitionEase)
		  
          .attr('d', function(d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
          })
          .remove();

        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      function computeRadius(d) {
        if (d.children || d._children) {
          return minRadius + (numEndNodes(d) / scalingFactor);
        } else {
          return minRadius;
        }
      }

      function numEndNodes(n) {
        var num = 0;
        if (n.children) {
          n.children.forEach(function(c) {
            num += numEndNodes(c);
          });
        } else if (n._children) {
          n._children.forEach(function(c) {
            num += numEndNodes(c);
          });
        } else {
          num++;
        }
        return num;
      }

      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }

        update(d);

        // fast-forward blank nodes
        if (d.children) {
          d.children.forEach(function(child) {
            if (child.isBlankNode && child._children) {
              click(child);
            }
          });
        }
      }

      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      update(root);
    }

    if (typeof module !== 'undefined' && module.exports) {
      module.exports = jsonldVis;
    } else {
      d3.jsonldVis = jsonldVis;
    }
  })();
	   
