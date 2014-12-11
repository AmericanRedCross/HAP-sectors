(function(){

    var sector_chart = dc.pieChart("#sector");
    var map_chart = dc.geoChoroplethChart("#map");

    // var geodata = "data/final_topo.json";
    
    // var geojson = topojson.feature(geodata, geodata.objects.p_code).features;

    d3.csv("data/data_website.csv", function(csv_data){

        var cf = crossfilter(csv_data);
        
        cf.sector = cf.dimension(function(d) { return d.SctrCluster; });

        cf.pcode = cf.dimension(function(d) { return d.CommuneCODE; });
        
        var sector = cf.sector.group();
        var pcode = cf.pcode.group();
        var all = cf.groupAll();

        sector_chart.width(240).height(240)
            .dimension(cf.sector)
            .group(sector)
            // .append("text")
            //     .attr("transform", function(d) { 
            //       return "translate" + ( (radius - 12) * Math.sin( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) + "," + ( -1 * (radius - 12) * Math.cos( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) + ")"; })
            //     .attr("dy", ".35em")
            //     .style("text-anchor", function(d) {
            //       var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
            //       if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
            //         return "middle";
            //       } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
            //         return "start";
            //       } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
            //         return "end";
            //       } else {
            //         return "middle";
            //       }
            //     })
                // .label(function(d) { 
                //   return d.sector.SctrCluster; })
            .innerRadius(20)
            .colors(['#fd8d3c',
                    '#fc4e2a',
                    '#e31a1c',
                    '#bd0026',
                    '#800026',
                    '#807dba',
                    '#6a51a3',
                    '#54278f',
                    '#3f007d'])
            .colorDomain([0,8])
            .colorAccessor(function(d, i){return i%9;});
            
        dc.dataCount("#count-info")
	.dimension(cf)
	.group(all);
                        
        // d3.json("data/Phil_provinces.geojson", function (provincesJSON) {
        d3.json("data/geo_topo.json", function (communesJSON) {


            map_chart.width(660).height(600)
                .dimension(cf.pcode)
                .group(pcode)
                .colors(['#E6E6E6', '#ED1B2E'])
                .colorDomain([0, 1])
                .colorAccessor(function (d) {
                    if(d>0){
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .projection(d3.geo.mercator().center([-72.5,19]).scale(12000))

                .overlayGeoJson(communesJSON.features, "Commune", function (d) {
                    return d.properties.p_code;
                })
                .title(function (d) {
                    return "Commune: " + pcode2comm[d.key];
                });

                $('#loading').hide();
                $('#dashboard').show();
                $('#map').show();
                dc.renderAll();     
            });
    });
})();