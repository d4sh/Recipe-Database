/**
 * Akhil Dalal
 * 100855466
 * Assignment 2 - 
 *   Build a client-server app that allows the user to retrieve, view,
 *   modify, and resubmit cooking recipes from the server.
 *
 * Server code template/"inspiration" from course website - 
 * http://people.scs.carleton.ca/~arunka/courses/comp2406/index.html
 * Specifically the code for moleServer2.js
 *
 * Server is Async ready.
 */

var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');

const ROOT = "./public_html";
const RECIPES = "./recipes/";

// R1.1 Set up the server to listen on port 2406.
var server = http.createServer(handleRequest);
server.listen(2406);

console.log('Server listening on port 2406');


function handleRequest(req, res) {
	console.log("Request for: " + req.url);

	var urlObj = url.parse(req.url);
  
	var filename = ROOT + req.url;

	// temp
	var pName = urlObj.pathname;

	// Parse url into directorypath and basename (file name if any).
	var dirPath = pName.slice(0, pName.lastIndexOf('/') + 1); // get directory
	var basename = pName.slice(pName.lastIndexOf('/') + 1, pName.length); // get filename
																		  //  empty if not there.

	var statusCode;
	var data = "";

  // R1.3 Route for /recipes/ before static serving.
  // This will catch both GET and POST requests.
  if (dirPath === "/recipes/") {
    /* 1) get request to populate the dropdown.
       2) get request to fetch file data.
       3) post request to update file.
	*/
    if (req.method === "GET" && basename.length === 0) {
      // R1.3 GET request will respond with array of filenames in a JSON object.
      // GET will always have a url like "/recipes/"

      fs.readdir(RECIPES, function(err, files){
              if (err) {
                serve404();
              } else {
                var fileObj = {list: files};
                filename = ".json";
                respond(200, JSON.stringify(fileObj));
              }
      });
    } else if(req.method === "GET"){
      // R1.4 GET request of the form "/recipes/name.json" returns the
      //      appropriate json file.
      fs.readFile(RECIPES + basename, "utf8", function(err, data){
        if (err) serve404();
        else {
          data = JSON.parse(data);
          filename = ".json";
          respond(200, JSON.stringify(data));
        }
      });
    } else if (req.method === "POST") {
		// R1.5 POST request will get data from client and update the file.
		// POST will always have a url like "/recipes/<name>.json"

		var postBody = "";
		req.on('data',function(chunk){      
			postBody+=chunk;
		});
		
		req.on('end', function() {
			fs.writeFile(RECIPES + basename, postBody, function(err) {
				if(err) {
					return console.log(err);
				}
				
				console.log("Successfully updated file!");
			});
		});
		
		respond(200, "OK");
    } else {
      respond(501, "Method not implemented.")
    }
  } else {
    // R1.2 Static serving

    // 1) http://localhost:2406 - ROOT
    // 2) anything else.
    /* Note: requesting another directory manually, i.e. by typing into url bar,
     *       will result in a 404 page. Exception is "/recipes/".
     *       i.e. Directory listing is disabled.
     */
    var stats = fs.stat(filename,function(err, stats){
          if(err){
            serve404();
          } else if (urlObj.pathname === "/") {
            filename = ROOT + "/index.html";
            fs.readFile(filename, "utf8", function(err, data){
              if (err) respond404();
              else respond(200, data);
            });
          } else if (stats.isDirectory()){
            serve404();
          }else{
            fs.readFile(filename, function(err, data){
              if(err)serve404();
              else respond(200,data);
            });
          }
        });
  }

  // serves 404 files
  function serve404(){
    fs.readFile(ROOT+"/404.html","utf8",function(err,data){
      if(err)respondErr(err);
      else respond(404,data);
    });
  }

  // responds in error, and outputs to the console
  function respondErr(err){
    respond(500,null);
    console.error(err.stack);
  }

  // sends off the response message
  function respond(code, data){
    // content header
    res.writeHead(code, {'content-type': mime.lookup(filename) || 'text/html'});
    // write message and signal communication is complete
    res.end(data);
  } 
}