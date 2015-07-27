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
var storiesGroup = svg.append('g').attr("id", "geo-stories");


function getGeo(){

    communeData  = topojson.feature(hispaniolaData, hispaniolaData.objects.hispaniola).features;
    // add Haiti communes to map
    communeGroup.selectAll("path")
      .data((communeData).filter(function(d){ return d.properties.p_code !== "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-commune")
    // add non-Haiti landmass to map
    otherGeoGroup.selectAll("path")
      .data((communeData).filter(function(d){ return d.properties.p_code == "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-other");

    // add points for stories to map
    d3.select("#custom-marker-pane").selectAll("div")
      .data(stories)
      .enter().append("div")
      .attr("class", "story-marker")
      .style("top", function(d){
        var top = Math.round(projection([d.long,d.lat])[1]) - 24;
        return top + "px";
      })
      .style("left", function(d){
        var left = Math.round(projection([d.long,d.lat])[0]) - 8;
        return left + "px";
      })
      .on("click",function(d) { clickedStory(d); })
      .on("mouseover", function(d){
        var tooltipText = "<i>Story: " + d.title + "</i>";
        $('#tooltip').append(tooltipText);
        d3.select(this).classed("active", true);
      })
      .on("mouseout", function(){
         $('#tooltip').empty();
         d3.select(this).classed("active", false);
      });

      // // if you want to see the allignment of the markers versus the actual coordinates
      // // uncomment out the following
      // //  you should calculate the offsets above in an image editing software, not with trial and error

      // storiesGroup.selectAll("circle")
      // .data(stories)
      // .enter().append("circle").attr("r", 4)
      // .attr("fill", "#ed1b2e")
      // .attr("cx", function(d){
      //   return projection([d.long,d.lat])[0]
      // })
      // .attr("cy", function(d){
      //   return projection([d.long,d.lat])[1]
      // })

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

}

function clickedStory(d){
  d3.select("#info-title").text(d.title);
  d3.select("#info-blurb").text(d.story);
  d3.select("#info-link").attr('href', info.link_1);
  var imgPath = "img/pics/" + d.story_name + ".jpg";
  d3.select("#info-pic").attr("src", imgPath);
  $("#info-links").html('<ul>');
  for(link in info.links){
    $("#info-links").append('<li><a href ="' + link + '" target="_blank">' + info.links[link] + '</a></li>');
  }
  $("#info-links").append('<ul>');
  // $("#info-links").empty(); // info-link is for clicked sectors
  $("#info").fadeIn();
}

function clickedSector(button) {
  // turn on only the clicked sector button
  d3.selectAll(".btn-custom-sector").classed("active", false);
  d3.select(button).classed("active", true);

  // find the active sector
  var activePrjSector = d3.select(".btn-custom-sector.active").attr("id");

  // remove highlighting from all mapped communes
  communeGroup.selectAll("path").classed("active-geo", false);
  // loop through the prj data...
  $(prjData).each(function(index, project){
    // is this project sector the active sector?
    if(project.SctrCluster.replace(/\s+/g, '') === activePrjSector){
      // if yes, color the corresponding commune
      communeGroup.selectAll("path").filter(function(d){ return d.properties.p_code == project.CommuneCODE } )
        .classed("active-geo", true);
    }
  });

  $(sectorInfo).each(function(index, info){
    // is this project sector the active sector?
    if(info.sector.replace(/\s+/g, '') === activePrjSector){
      // if yes, populate the info box
      d3.select("#info-title").text(info.sector);
      d3.select("#info-blurb").text(info.blurb);
      d3.select("#info-link").attr('href', info.link_1);
      var imgPath = "img/pics/" + info.story_name + ".jpg";
      d3.select("#info-pic").attr("src", imgPath);
      $("#info-links").html('<ul>');
      for(link in info.links){
        $("#info-links").append('<li><a href ="' + link + '" target="_blank">' + info.links[link] + '</a></li>');
      }
      $("#info-links").append('<ul>');
    }
  });

  $("#info").fadeIn();


}

function resetMap(){
  communeGroup.selectAll("path").classed("active-geo", false);
  d3.selectAll(".btn-custom-sector").classed("active", false);
}


$("#dismiss").click(function(){
  $("#info").fadeOut();
});

getGeo();
