var width = 533;
    height = 429;

var projection = d3.geo.mercator()
    .scale(5000)
    .translate([width / 2, height / 2]);

// haitiBoundingBox is included in the fitProjection.js file
fitProjection(projection, haitiBoundingBox, [[0,0],[width, height]]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "map");

var otherGeoGroup = svg.append('g').attr("id", "geo-other");
var communeGroup = svg.append('g').attr("id", "geo-commune");


function getGeo(){
  
    communeData  = topojson.feature(hispaniolaData, hispaniolaData.objects.hispaniola).features;
    // add Haiti communes to map
    communeGroup.selectAll("path")
      .data((communeData).filter(function(d){ return d.properties.p_code !== "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-commune")
      .on("click",clickedCommune)
      .on("mouseover", function(d){ 
        var tooltipText = "<strong>" + d.properties.Commune + "</strong>";
        $('#tooltip').append(tooltipText);                
      })
      .on("mouseout", function(){ 
         $('#tooltip').empty();        
      });
    // add non-Haiti landmass to map
    otherGeoGroup.selectAll("path")
      .data((communeData).filter(function(d){ return d.properties.p_code == "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-other");

    colorProjectAreas();
   
}


// style the commmunes with projects differently from those with none
function colorProjectAreas(){
  var allProjectCommunes = [];
  $(prjData).each(function(index, project){
    if($.inArray(project.CommuneCODE, allProjectCommunes) == -1){
      allProjectCommunes.push(project.CommuneCODE);
    }
  });
  $(allProjectCommunes).each(function(index, commune){
    communeGroup.selectAll("path").filter(function(d){ return d.properties.p_code == commune } )
      .classed("poly-commune-hasprojects", true);
  });

  // load with shelter sector active
  $("#Shelter").click();
  
}

function clickedCommune(){
  // toggle the clicked commune
  if(d3.select(this).classed("active-geo")){
    d3.select(this).classed("active-geo",false);
  } else {
    d3.select(this).classed("active-geo",true);
  }

  var activeCommunes = [];
  var communePrjSectors = [];

  // select all highlighted communes and built a list of their p-codes
  communeGroup.selectAll(".active-geo").each(function(d){
    activeCommunes.push(d.properties.p_code);
  });

  // loop through projects 
  // and if the project area p-code matches a highlighted commune
  // and the prj sector is not yet in our list of active sectors
  // and the prj sector is not an empty string
  // then push the prj sector to our list
  $(prjData).each(function(index, project){
    if($.inArray(project.CommuneCODE, activeCommunes) !== -1 && $.inArray(project.SctrCluster.replace(/\s+/g, ''), communePrjSectors) == -1 && project.SctrCluster !== ""){
        communePrjSectors.push(project.SctrCluster.replace(/\s+/g, ''));
    }
  });
  // select the buttons that correspond to our active sectors and
  // set them active
  d3.selectAll(".btn-custom-sector").classed("active", false);
  $(communePrjSectors).each(function(index, sector){
    var selector = "#" + sector;
    d3.select(selector).classed("active", true);
  }); 
}

function clickedSector(button) {
  // toggle the sector button
  if(d3.select(button).classed("active")){
    d3.select(button).classed("active",false);
  } else {
    d3.select(button).classed("active",true);
  }

  var activePrjSectors = [];

  // build a list of active sectors
  d3.selectAll(".btn-custom-sector").filter(".active").each(function(d){
    activePrjSectors.push($(this).attr("id"));
  });

  // remove highlighting from all mapped communes
  communeGroup.selectAll("path").classed("active-geo", false);
  // loop through the prj data...
  $(prjData).each(function(index, project){
    // is this project sector an active sector?
    if($.inArray(project.SctrCluster.replace(/\s+/g, ''), activePrjSectors) !== -1){
      // if yes, color the corresponding commune
      communeGroup.selectAll("path").filter(function(d){ return d.properties.p_code == project.CommuneCODE } )
        .classed("active-geo", true);
    }
  });
}

function resetMap(){
  communeGroup.selectAll("path").classed("active-geo", false);
  d3.selectAll(".btn-custom-sector").classed("active", false);
}


getGeo();