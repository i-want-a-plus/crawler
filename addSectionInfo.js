const _ = require('lodash');
var rp = require('request-promise');
var cheerio = require('cheerio');
var model = require('./model');
const { composeUri } = require('./util');

model.Course.findAll({
	attributes: ['year', 'term', 'subject', 'course']
}).then((res) => {
	var keys = [ 'year', 'term', 'subject', 'course' ];
	var _length = res.length;
	for (i = 0; i < _length; i++){
		var input = [];
		input.push(res[i].year)
		input.push(res[i].term)
		input.push(res[i].subject)
		input.push(res[i].course)
		addSection(keys, input);
	}
});

function addSection(keys, input){

var options = {
    uri: composeUri([ 'schedule', ...input ]),
    transform: function (body) {
        return { $: cheerio.load(body), body };
    }
};

var Courses = {};


let parsers = {
	status: (v) => cheerio.load(v)('span').first().text(),
	type: (v) => 
	{
		//console.log(cheerio.load(v).text());
	},
	section: (v) => 
	{
		return String(cheerio.load(v).text()).substring(0,3);
	},
	time: (v) => 
	{	
		var reg = /\d{2}:\d{2}[A-Z]{2}\s-\s\d{2}:\d{2}[A-Z]{2}/gmi;
		return _.uniq(String(cheerio.load(v)('div').text()).match(reg));
		
	},
	day: (v) => 
	{
		var reg = /[A-Z]+/gmi;
		return _.uniq(String(cheerio.load(v).text()).match(reg));
	},
	location: (v) => 
	{	var locations = [];
		$ = cheerio.load(v);
		$('div').each(function(i, elem){
		locations.push($(this).text());
		});
		return locations;
	},
	instructor: (v) => 
	{	
		var reg = /[A-Z][a-z]*,\s[A-Z]/gm;
		return _.uniq(String(cheerio.load(v).text()).match(reg));
	}
};

rp(options)
    .then(function ({ $, body }) {
    	var couseString = String($('.app-inline').text());
    	
        Courses['course'] = couseString.substring(0, couseString.indexOf(' '));
        Courses['subject'] = couseString.substring(couseString.indexOf(' ') + 1);
        Courses['title'] = $('.app-label.app-text-engage').text();      
        Courses['Gened'] = [];

        let sections = eval('(function(){' + body.match(/var sectionDataObj = ([^;]*);/gmi)[0] + ';return sectionDataObj;})()');

        sections = _.map(sections, section => _.pick(_.mapValues(section, (v, k, o) => {
        	if (_.has(parsers, k)) return parsers[k](v); else return v;
        }), [ 'status', 'crn', 'section', 'time', 'day', 'location', 'instructor' ]));

        Courses['Sections'] = sections;

        $('.list-unstyled.sort-list li').each(function(){
        	Courses['Gened'].push($(this).text());
    	});

        let _sections = [];
        _.forEach(sections, (value) => {
        	sec = {
        		year: input[0],
        		term: input[1],
        		subject: input[2],
        		course: input[3],
        		crn: value['crn'],
        		status: value['status'],
        		section: value['section'],
        		time: value['time'].join('@'),
        		day: value['day'].join('@'),
        		location: value['location'].join('@'),
        		instructor: value['instructor'].join('@')
        	};
        	_sections.push(sec);
        });


        //return model.Section.bulkCreate(
        //      _.map(_sections, section => _.set(section, 'CourseId', 1)), {
        //  });

        return model.Course.findOne({
			where: _.zipObject(keys, input)
		}).then(({ id }) => {
			return model.Section.bulkCreate(
				_.map(_sections, section => _.set(section, 'CourseId', id)), {
				includes: [ model.Course ]
			});
		});

        //console.log(Courses);
        //console.log(JSON.stringify(Courses));
    })
    .catch(function (err) {
        console.log(err);
    });

}


