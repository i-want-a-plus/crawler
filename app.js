var rp = require('request-promise');
var cheerio = require('cheerio');

var options = {
    uri: 'https://courses.illinois.edu/schedule/2018/spring/AAS/100',
    transform: function (body) {
        return cheerio.load(body);
    }
};

var Courses = {};


rp(options)
    .then(function ($) {
    	var couseString = String($('.app-inline').text());
    	
    	console.log($('.adjh.td-break').text());

        Courses['course'] = couseString.substring(0, couseString.indexOf(' '));
        Courses['subject'] = couseString.substring(couseString.indexOf(' ') + 1);
        Courses['title'] = $('.app-label.app-text-engage').text();      
        Courses['Gened'] = [];
        Courses['Sections'] = [];
        $('.list-unstyled.sort-list li').each(function(){
        	Courses['Gened'].push($(this).text());
    	});
    	$('.adjh.td-break.sorting_1').each(function(){
    		Courses['Sections'].push($(this).text());
    	});
    	console.log(Courses);
    })
    .catch(function (err) {
        console.log(err);
    });


